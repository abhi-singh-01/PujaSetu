package com.pujasetu.repository;

import com.pujasetu.model.Provider;
import com.pujasetu.model.enums.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ProviderRepository extends MongoRepository<Provider, String> {

    Optional<Provider> findByUserId(String userId);

    List<Provider> findByVerificationStatusOrderByCreatedAtDesc(VerificationStatus status);

    Page<Provider> findByIsActiveTrueAndVerificationStatus(
            VerificationStatus status,
            Pageable pageable
    );

    long countByVerificationStatus(VerificationStatus status);
}
