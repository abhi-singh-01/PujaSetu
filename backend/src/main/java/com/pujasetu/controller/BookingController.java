package com.pujasetu.controller;

import com.pujasetu.model.User;
import com.pujasetu.security.SecurityUtils;
import com.pujasetu.service.BookingService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings")
public class BookingController {

    private final BookingService bookingService;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> body) {
        User user = securityUtils.requireCurrentUser().getUser();
        return ResponseEntity.status(201).body(bookingService.createBooking(user, body));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getMyBookings() {
        User user = securityUtils.requireCurrentUser().getUser();
        return ResponseEntity.ok(bookingService.getMyBookings(user));
    }

    @PostMapping("/payment/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(bookingService.verifyPayment(body));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable String id) {
        User user = securityUtils.requireCurrentUser().getUser();
        return ResponseEntity.ok(bookingService.getBookingById(user, id));
    }

    @GetMapping("/{id}/completion-otp/status")
    public ResponseEntity<Map<String, Object>> completionOtpStatus(@PathVariable String id) {
        User user = securityUtils.requireCurrentUser().getUser();
        return ResponseEntity.ok(bookingService.getCompletionOtpStatus(user, id));
    }

    @PostMapping("/{id}/payment/order")
    public ResponseEntity<Map<String, Object>> createPaymentOrder(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        User user = securityUtils.requireCurrentUser().getUser();
        String paymentType = body != null && body.get("paymentType") != null ? body.get("paymentType") : "advance";
        return ResponseEntity.ok(bookingService.createPaymentOrder(user, id, paymentType));
    }

    @PostMapping("/{id}/mark-service-complete")
    @PreAuthorize("hasAnyRole('PANDIT', 'NAI')")
    public ResponseEntity<Map<String, Object>> markServiceComplete(@PathVariable String id) {
        User user = securityUtils.requireCurrentUser().getUser();
        return ResponseEntity.ok(bookingService.markServiceComplete(user, id));
    }

    @PostMapping("/{id}/verify-completion-otp")
    public ResponseEntity<Map<String, Object>> verifyCompletionOtp(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {
        User user = securityUtils.requireCurrentUser().getUser();
        return ResponseEntity.ok(bookingService.verifyCompletionOtp(
                user, id, body.get("otp"), body.get("role")));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'PANDIT', 'NAI')")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {
        User user = securityUtils.requireCurrentUser().getUser();
        return ResponseEntity.ok(bookingService.updateBookingStatus(user, id, body.get("status")));
    }
}
