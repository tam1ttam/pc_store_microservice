package com.tam.profile.service.impl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tam.profile.dto.request.AddressRequest;
import com.tam.profile.dto.request.CustomerCreationRequest;
import com.tam.profile.dto.request.CustomerUpdateRequest;
import com.tam.profile.dto.request.ProfileCompletionRequest;
import com.tam.profile.dto.response.CustomerResponse;
import com.tam.profile.entity.Address;
import com.tam.profile.entity.Customer;
import com.tam.profile.mapper.CustomerMapper;
import com.tam.profile.repository.CustomerRepository;
import com.tam.profile.service.CustomerService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CustomerServiceImpl implements CustomerService {
    CustomerRepository customerRepository;
    CustomerMapper customerMapper;

    @Override
    public CustomerResponse createCustomer(CustomerCreationRequest request) {
        log.info("Creating customer with userName: {}", request.getUserName());

        if (customerRepository.existsByUserName(request.getUserName())) {
            throw new RuntimeException("Người dùng đã tồn tại");
        }

        Customer customer = customerMapper.toCustomer(request);
        if (request.getUserId() != null && !request.getUserId().isBlank()) {
            customer.setUserId(request.getUserId());
        }
        customer = customerRepository.save(customer);

        log.info("Customer created successfully with id: {}", customer.getId());
        return customerMapper.toCustomerResponse(customer);
    }

    @Override
    public CustomerResponse getCustomerByUserName(String userName) {
        log.info("Getting customer with userName: {}", userName);

        Customer customer = customerRepository
                .findByUserName(userName)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        return customerMapper.toCustomerResponse(customer);
    }

    @Override
    public CustomerResponse getCustomerByUserId(String userId) {
        log.info("Getting customer with userId: {}", userId);

        Customer customer = customerRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        return customerMapper.toCustomerResponse(customer);
    }

    @Override
    public CustomerResponse getInfo() {
        log.info("Getting current user info from SecurityContext");

        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        Customer customer = customerRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        return customerMapper.toCustomerResponse(customer);
    }

    @Override
    public CustomerResponse updateProfile(String userName, CustomerUpdateRequest request) {
        log.info("Updating profile for userName: {}", userName);

        String currentUser =
                SecurityContextHolder.getContext().getAuthentication().getName();

        if (!userName.equals(currentUser)) {
            throw new RuntimeException("Bạn không có quyền cập nhật profile của người dùng khác");
        }

        Customer customer = customerRepository
                .findByUserName(userName)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        customerMapper.updateCustomerFromRequest(request, customer);
        customer = customerRepository.save(customer);

        log.info("Profile updated successfully for userName: {}", userName);
        return customerMapper.toCustomerResponse(customer);
    }

    @Override
    public CustomerResponse updateCustomer(String userName, CustomerUpdateRequest request) {
        Customer customer =
                customerRepository.findByUserName(userName).orElseThrow(() -> new RuntimeException("User not found"));
        customerMapper.updateCustomerFromRequest(request, customer);
        customer = customerRepository.save(customer);
        return customerMapper.toCustomerResponse(customer);
    }

    @Override
    public CustomerResponse completeProfile(ProfileCompletionRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Completing profile for userId: {}", userId);

        Customer customer = customerRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        customer.setFirstName(request.getFirstName());
        customer.setLastName(request.getLastName());
        customer.setEmail(request.getEmail());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setCity(request.getCity());
        customer.setGender(request.getGender());
        customer.setDefaultPhoneNumber(request.getDefaultPhoneNumber());
        customer.setDefaultEmail(request.getDefaultEmail());

        if (request.getDob() != null && !request.getDob().isBlank()) {
            customer.setDob(LocalDate.parse(request.getDob()));
        }

        List<Address> addresses = new ArrayList<>();
        boolean hasDefault = request.getAddresses().stream().anyMatch(a -> Boolean.TRUE.equals(a.getIsDefault()));
        for (int i = 0; i < request.getAddresses().size(); i++) {
            AddressRequest ar = request.getAddresses().get(i);
            Address address = customerMapper.toAddress(ar);
            address.setId(UUID.randomUUID().toString());
            address.setIsActive(true);
            if (!hasDefault && i == 0) {
                address.setIsDefault(true);
            }
            addresses.add(address);
        }
        customer.setAddresses(addresses);
        customer.setIsActive(true);

        customer = customerRepository.save(customer);
        log.info("Profile completed for userId: {}", userId);
        return customerMapper.toCustomerResponse(customer);
    }

    @Override
    public CustomerResponse updateAvatar(String avatarUrl) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Customer customer = customerRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
        customer.setAvatar(avatarUrl);
        customer = customerRepository.save(customer);
        return customerMapper.toCustomerResponse(customer);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public Page<CustomerResponse> getAllCustomers(Pageable pageable) {
        log.info("Getting all customers with pagination: {}", pageable);

        Page<Customer> customers = customerRepository.findAll(pageable);
        return customers.map(customerMapper::toCustomerResponse);
    }

    @Override
    public Page<CustomerResponse> searchCustomersByName(String searchKey, Pageable pageable) {
        log.info("Searching customers by name: {}", searchKey);

        Page<Customer> customers = customerRepository.findAllByFirstNameOrLastName(searchKey, pageable);

        return customers.map(customerMapper::toCustomerResponse);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteCustomer(String userName) {
        log.info("Deleting customer with userName: {}", userName);

        Customer customer = customerRepository
                .findByUserName(userName)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        customerRepository.delete(customer);

        log.info("Customer deleted successfully with userName: {}", userName);
    }

    @Override
    public boolean existsCustomerByUserName(String userName) {
        return customerRepository.existsByUserName(userName);
    }

    @Override
    public long countCustomers() {
        return customerRepository.count();
    }
}
