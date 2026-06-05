package com.pujasetu.repository;

import com.pujasetu.model.Booking;
import com.pujasetu.model.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByCustomerIdOrderByCreatedAtDesc(String customerId);

    List<Booking> findByProviderIdOrderByCreatedAtDesc(String providerId);

    Page<Booking> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByStatus(BookingStatus status);
}
