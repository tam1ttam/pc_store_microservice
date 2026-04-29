package com.tam.profile.repository;

import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.tam.profile.entity.Customer;

@Repository
public interface CustomerRepository extends MongoRepository<Customer, ObjectId> {
    Optional<Customer> findByUserName(String userName);

    @Query("{ 'firstName': { $regex: ?0, $options: 'i' } }")
    Page<Customer> findAllByFirstName(String firstName, Pageable pageable);

    @Query("{ 'lastName': { $regex: ?0, $options: 'i' } }")
    Page<Customer> findAllByLastName(String lastName, Pageable pageable);

    @Query("{ $or: [ { 'firstName': { $regex: ?0, $options: 'i' } }, { 'lastName': { $regex: ?0, $options: 'i' } } ] }")
    Page<Customer> findAllByFirstNameOrLastName(String searchKey, Pageable pageable);

    boolean existsByUserName(String userName);
}
