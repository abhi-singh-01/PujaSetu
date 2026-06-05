package com.pujasetu.repository;

import com.pujasetu.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByMobile(String mobile);

    Optional<User> findByEmail(String email);

    Page<User> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
