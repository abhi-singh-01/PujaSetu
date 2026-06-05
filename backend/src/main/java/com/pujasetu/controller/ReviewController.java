package com.pujasetu.controller;

import com.pujasetu.service.ReviewService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final com.pujasetu.security.SecurityUtils securityUtils;

    @GetMapping("/provider/{providerId}")
    public ResponseEntity<Map<String, Object>> getProviderReviews(@PathVariable String providerId) {
        return ResponseEntity.ok(reviewService.getProviderReviews(providerId));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createReview(@RequestBody Map<String, Object> body) {
        var user = securityUtils.requireCurrentUser().getUser();
        return ResponseEntity.status(201).body(reviewService.createReview(
                user,
                (String) body.get("bookingId"),
                ((Number) body.get("rating")).intValue(),
                (String) body.get("comment")
        ));
    }

    @PostMapping("/{id}/report")
    public ResponseEntity<Map<String, Object>> reportReview(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.ok(reviewService.reportReview(id, body.get("reason")));
    }
}
