package com.pujasetu.service;

import com.pujasetu.exception.ApiException;
import com.pujasetu.exception.ResourceNotFoundException;
import com.pujasetu.model.Booking;
import com.pujasetu.model.Review;
import com.pujasetu.model.User;
import com.pujasetu.model.enums.BookingStatus;
import com.pujasetu.repository.BookingRepository;
import com.pujasetu.repository.ProviderRepository;
import com.pujasetu.repository.ReviewRepository;
import com.pujasetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final ProviderRepository providerRepository;
    private final UserRepository userRepository;

    public Map<String, Object> createReview(User user, String bookingId, int rating, String comment) {
        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        if (booking == null || !booking.getCustomerId().equals(user.getId())) {
            throw new ApiException("Invalid booking", 400);
        }
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new ApiException("Booking must be completed", 400);
        }
        if (reviewRepository.findByBookingId(bookingId).isPresent()) {
            throw new ApiException("Already reviewed", 400);
        }

        Review review = reviewRepository.save(Review.builder()
                .bookingId(bookingId)
                .customerId(user.getId())
                .providerId(booking.getProviderId())
                .rating(rating)
                .comment(comment)
                .build());

        List<Review> reviews = reviewRepository.findByProviderId(booking.getProviderId());
        double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0);
        providerRepository.findById(booking.getProviderId()).ifPresent(provider -> {
            provider.setRating(Math.round(avg * 10.0) / 10.0);
            provider.setReviewCount(reviews.size());
            providerRepository.save(provider);
        });

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("review", enrichReview(review));
        return response;
    }

    public Map<String, Object> getProviderReviews(String providerId) {
        List<Map<String, Object>> reviews = reviewRepository
                .findByProviderIdAndIsReportedFalseOrderByCreatedAtDesc(providerId)
                .stream().map(this::enrichReview).toList();
        return Map.of("success", true, "reviews", reviews);
    }

    public Map<String, Object> reportReview(String reviewId, String reason) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        review.setReported(true);
        review.setReportReason(reason);
        reviewRepository.save(review);
        return Map.of("success", true, "message", "Review reported");
    }

    private Map<String, Object> enrichReview(Review review) {
        Map<String, Object> map = new HashMap<>();
        map.put("_id", review.getId());
        map.put("booking", review.getBookingId());
        map.put("rating", review.getRating());
        map.put("comment", review.getComment());
        map.put("createdAt", review.getCreatedAt());
        userRepository.findById(review.getCustomerId()).ifPresent(u ->
                map.put("customer", Map.of("_id", u.getId(), "name", u.getName(), "profilePhoto", u.getProfilePhoto())));
        return map;
    }
}
