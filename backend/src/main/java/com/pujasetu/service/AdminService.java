package com.pujasetu.service;

import com.pujasetu.exception.ResourceNotFoundException;
import com.pujasetu.mapper.BookingMapper;
import com.pujasetu.model.Booking;
import com.pujasetu.model.User;
import com.pujasetu.model.enums.BookingStatus;
import com.pujasetu.model.enums.VerificationStatus;
import com.pujasetu.repository.BookingRepository;
import com.pujasetu.repository.ProviderRepository;
import com.pujasetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ProviderRepository providerRepository;
    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;
    private final MongoTemplate mongoTemplate;

    public Map<String, Object> getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalProviders = providerRepository.countByVerificationStatus(VerificationStatus.APPROVED);
        long pendingProviders = providerRepository.countByVerificationStatus(VerificationStatus.PENDING);
        long totalBookings = bookingRepository.count();
        long confirmedBookings = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        long completedBookings = bookingRepository.countByStatus(BookingStatus.COMPLETED);

        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("payment.advancePaid").is(true)),
                Aggregation.group().sum("amount").as("total")
        );
        AggregationResults<Map> revenue = mongoTemplate.aggregate(aggregation, "bookings", Map.class);
        Number totalRevenue = 0;
        if (!revenue.getMappedResults().isEmpty()) {
            totalRevenue = (Number) revenue.getMappedResults().getFirst().get("total");
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalProviders", totalProviders);
        stats.put("pendingProviders", pendingProviders);
        stats.put("totalBookings", totalBookings);
        stats.put("confirmedBookings", confirmedBookings);
        stats.put("completedBookings", completedBookings);
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue.intValue() : 0);

        return Map.of("success", true, "stats", stats);
    }

    public Map<String, Object> getAllUsers() {
        List<User> users = userRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 100)).getContent();
        return Map.of("success", true, "users", users);
    }

    public Map<String, Object> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 100)).getContent();
        return Map.of("success", true, "bookings", bookings.stream().map(bookingMapper::toResponse).toList());
    }

    public Map<String, Object> toggleUserActive(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(!user.isActive());
        user = userRepository.save(user);
        return Map.of("success", true, "user", user);
    }
}
