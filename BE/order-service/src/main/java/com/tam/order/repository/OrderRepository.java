package com.devteria.order.repository;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.devteria.order.entity.Order;

@Repository
public interface OrderRepository extends MongoRepository<Order, ObjectId> {
    Order findOrderByCustomerId(ObjectId customerId);

    List<Order> findAllByCustomerId(ObjectId customerId);

    Page<Order> findAllBy(Pageable pageable);

    List<Order> findByCustomerId(ObjectId customerId);

    @Query("{ 'customer_id': ?0, 'orderStatus': ?1 }")
    List<Order> findByCustomerIdAndStatus(ObjectId customerId, String status);

    @Query("{ 'orderStatus': ?0 }")
    Page<Order> findByOrderStatus(String status, Pageable pageable);
}
