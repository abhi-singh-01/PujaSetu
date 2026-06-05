package com.pujasetu.repository;

import com.pujasetu.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends MongoRepository<Review, String> {

    Optional<Review> findByBookingId(String bookingId);

    List<Review> findByProviderIdAndIsReportedFalseOrderByCreatedAtDesc(String providerId);

    List<Review> findByProviderId(String providerId);
}
