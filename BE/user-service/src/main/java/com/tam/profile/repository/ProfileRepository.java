package com.tam.profile.repository;

import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.tam.profile.entity.Profile;

@Repository
public interface ProfileRepository extends MongoRepository<Profile, ObjectId> {
    Optional<Profile> findByUserName(String userName);

    @Query("{ $or: [ { 'firstName': { $regex: ?0, $options: 'i' } }, { 'lastName': { $regex: ?0, $options: 'i' } } ] }")
    Page<Profile> findAllByFirstNameOrLastName(String searchKey, Pageable pageable);

    boolean existsByUserName(String userName);

    Optional<Profile> findByUserId(String userId);
}
