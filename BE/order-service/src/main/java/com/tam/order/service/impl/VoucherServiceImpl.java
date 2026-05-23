package com.tam.order.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tam.order.dto.request.ApplyVoucherRequest;
import com.tam.order.dto.request.VoucherRequest;
import com.tam.order.dto.response.VoucherResponse;
import com.tam.order.entity.Order;
import com.tam.order.entity.OrderStatus;
import com.tam.order.entity.OrderVoucher;
import com.tam.order.entity.Voucher;
import com.tam.order.entity.VoucherAccessType;
import com.tam.order.entity.VoucherUsage;
import com.tam.order.repository.OrderRepository;
import com.tam.order.repository.OrderVoucherRepository;
import com.tam.order.repository.VoucherRepository;
import com.tam.order.repository.VoucherUsageRepository;
import com.tam.order.service.VoucherService;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class VoucherServiceImpl implements VoucherService {

    VoucherRepository voucherRepository;
    OrderRepository orderRepository;
    OrderVoucherRepository orderVoucherRepository;
    VoucherUsageRepository voucherUsageRepository;

    @Override
    public VoucherResponse create(VoucherRequest request) {
        if (voucherRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Voucher code already exists");
        }
        VoucherAccessType accessType =
                request.getAccessType() != null ? request.getAccessType() : VoucherAccessType.PUBLIC;
        return toResponse(voucherRepository.save(Voucher.builder()
                .code(request.getCode())
                .description(request.getDescription())
                .discountAmount(request.getDiscountAmount())
                .discountPercent(request.getDiscountPercent())
                .maxUsage(request.getMaxUsage())
                .expiredAt(request.getExpiredAt())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .voucherType(request.getVoucherType())
                .accessType(accessType)
                .userId(accessType == VoucherAccessType.PRIVATE ? request.getUserId() : null)
                .maxUsagePerUser(accessType == VoucherAccessType.PUBLIC ? request.getMaxUsagePerUser() : null)
                .build()));
    }

    @Override
    public VoucherResponse update(Long id, VoucherRequest request) {
        Voucher voucher = voucherRepository.findById(id).orElseThrow(() -> new RuntimeException("Voucher not found"));
        if (!voucher.getCode().equals(request.getCode()) && voucherRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Voucher code already exists");
        }
        VoucherAccessType accessType =
                request.getAccessType() != null ? request.getAccessType() : voucher.getAccessType();
        voucher.setCode(request.getCode());
        voucher.setDescription(request.getDescription());
        voucher.setDiscountAmount(request.getDiscountAmount());
        voucher.setDiscountPercent(request.getDiscountPercent());
        voucher.setMaxUsage(request.getMaxUsage());
        voucher.setExpiredAt(request.getExpiredAt());
        voucher.setAccessType(accessType);
        voucher.setUserId(accessType == VoucherAccessType.PRIVATE ? request.getUserId() : null);
        voucher.setMaxUsagePerUser(accessType == VoucherAccessType.PUBLIC ? request.getMaxUsagePerUser() : null);
        if (request.getIsActive() != null) voucher.setIsActive(request.getIsActive());
        if (request.getVoucherType() != null) voucher.setVoucherType(request.getVoucherType());
        return toResponse(voucherRepository.save(voucher));
    }

    @Override
    public void delete(Long id) {
        voucherRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherResponse getById(Long id) {
        return voucherRepository
                .findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<VoucherResponse> getAll() {
        return voucherRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<VoucherResponse> getAvailableForUser(String userId) {
        return voucherRepository.findAvailableForUser(userId, LocalDateTime.now()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public Order applyVoucher(ApplyVoucherRequest request, String userId) {
        Order order = orderRepository
                .findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (order.getOrderStatus() != OrderStatus.DELIVERING) {
            throw new RuntimeException("Cannot apply voucher at this order stage");
        }
        Voucher voucher = voucherRepository
                .findByCode(request.getVoucherCode())
                .orElseThrow(() -> new RuntimeException("Voucher not found"));
        if (!voucher.getIsActive()) throw new RuntimeException("Voucher is not active");
        if (voucher.getExpiredAt() != null && voucher.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Voucher has expired");
        }
        if (voucher.getMaxUsage() != null && voucher.getUsedCount() >= voucher.getMaxUsage()) {
            throw new RuntimeException("Voucher usage limit reached");
        }
        if (orderVoucherRepository.existsByOrderIdAndVoucherId(order.getId(), voucher.getId())) {
            throw new RuntimeException("Voucher already applied to this order");
        }

        if (voucher.getAccessType() == VoucherAccessType.PRIVATE) {
            if (!userId.equals(voucher.getUserId())) {
                throw new RuntimeException("This voucher is not assigned to you");
            }
        } else {
            // PUBLIC: check per-user limit
            if (voucher.getMaxUsagePerUser() != null && voucher.getMaxUsagePerUser() > 0) {
                VoucherUsage usage = voucherUsageRepository
                        .findByVoucherIdAndUserId(voucher.getId(), userId)
                        .orElse(null);
                int currentUserUsage = usage != null ? usage.getUsageCount() : 0;
                if (currentUserUsage >= voucher.getMaxUsagePerUser()) {
                    throw new RuntimeException("You have reached the usage limit for this voucher");
                }
            }
        }

        double discount = calculateDiscount(voucher, order.getTotalPrice());
        orderVoucherRepository.save(OrderVoucher.builder()
                .order(order)
                .voucher(voucher)
                .discountApplied(discount)
                .build());
        order.setTotalPrice(Math.max(0, order.getTotalPrice() - discount));
        voucher.setUsedCount(voucher.getUsedCount() + 1);
        voucherRepository.save(voucher);

        // Track per-user usage for PUBLIC vouchers
        if (voucher.getAccessType() == VoucherAccessType.PUBLIC) {
            VoucherUsage usage = voucherUsageRepository
                    .findByVoucherIdAndUserId(voucher.getId(), userId)
                    .orElse(VoucherUsage.builder()
                            .voucherId(voucher.getId())
                            .userId(userId)
                            .build());
            usage.setUsageCount(usage.getUsageCount() + 1);
            voucherUsageRepository.save(usage);
        }

        return orderRepository.save(order);
    }

    @Override
    public Order unapplyVoucher(Long orderId, String voucherCode, String userId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        Voucher voucher =
                voucherRepository.findByCode(voucherCode).orElseThrow(() -> new RuntimeException("Voucher not found"));
        OrderVoucher ov = orderVoucherRepository
                .findByOrderIdAndVoucherId(order.getId(), voucher.getId())
                .orElseThrow(() -> new RuntimeException("Voucher not applied to this order"));

        order.setTotalPrice(order.getTotalPrice() + ov.getDiscountApplied());
        voucher.setUsedCount(Math.max(0, voucher.getUsedCount() - 1));
        voucherRepository.save(voucher);
        orderVoucherRepository.delete(ov);

        // Roll back per-user usage for PUBLIC vouchers
        if (voucher.getAccessType() == VoucherAccessType.PUBLIC && userId != null) {
            voucherUsageRepository
                    .findByVoucherIdAndUserId(voucher.getId(), userId)
                    .ifPresent(usage -> {
                        usage.setUsageCount(Math.max(0, usage.getUsageCount() - 1));
                        voucherUsageRepository.save(usage);
                    });
        }

        return orderRepository.save(order);
    }

    private double calculateDiscount(Voucher voucher, double total) {
        if (voucher.getDiscountAmount() != null && voucher.getDiscountAmount() > 0) {
            return voucher.getDiscountAmount();
        }
        if (voucher.getDiscountPercent() != null && voucher.getDiscountPercent() > 0) {
            return total * voucher.getDiscountPercent() / 100.0;
        }
        return 0;
    }

    private VoucherResponse toResponse(Voucher v) {
        return VoucherResponse.builder()
                .id(v.getId())
                .code(v.getCode())
                .description(v.getDescription())
                .discountAmount(v.getDiscountAmount())
                .discountPercent(v.getDiscountPercent())
                .maxUsage(v.getMaxUsage())
                .usedCount(v.getUsedCount())
                .expiredAt(v.getExpiredAt())
                .isActive(v.getIsActive())
                .voucherType(v.getVoucherType())
                .accessType(v.getAccessType())
                .userId(v.getUserId())
                .maxUsagePerUser(v.getMaxUsagePerUser())
                .build();
    }
}
