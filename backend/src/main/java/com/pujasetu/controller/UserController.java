package com.pujasetu.controller;

import com.pujasetu.model.User;
import com.pujasetu.security.SecurityUtils;
import com.pujasetu.service.AuthService;
import com.pujasetu.service.BookingService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users")
public class UserController {

    private final AuthService authService;
    private final BookingService bookingService;
    private final SecurityUtils securityUtils;

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile() {
        User user = securityUtils.requireCurrentUser().getUser();
        return ResponseEntity.ok(authService.getMe(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody Map<String, Object> body) {
        User user = securityUtils.requireCurrentUser().getUser();
        return ResponseEntity.ok(authService.updateProfile(user, body));
    }

    @GetMapping("/bookings")
    public ResponseEntity<Map<String, Object>> bookingHistory() {
        User user = securityUtils.requireCurrentUser().getUser();
        return ResponseEntity.ok(bookingService.getMyBookings(user));
    }
}
