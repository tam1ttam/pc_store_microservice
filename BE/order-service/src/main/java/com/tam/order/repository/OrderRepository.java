package com.tam.order.repository;

import java.util.List;
import java.util.Optional; // Import cực kỳ quan trọng ở đây

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.tam.order.entity.Order;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {

    Order findOrderByCustomerId(String customerId);

    List<Order> findAllByCustomerId(String customerId);

    Page<Order> findAllBy(Pageable pageable);

    List<Order> findByCustomerId(String customerId);

    @Query("{ 'customerId': ?0, 'orderStatus': ?1 }")
    List<Order> findByCustomerIdAndOrderStatus(String customerId, String status);

    @Query("{ 'orderStatus': ?0 }")
    Page<Order> findByOrderStatus(String status, Pageable pageable);

    // Hàm này để lấy duy nhất 1 giỏ hàng để xử lý xóa item
    Optional<Order> findFirstByCustomerIdAndOrderStatus(String customerId, String status);
}