package com.pujasetu.controller;

import com.pujasetu.service.AdminService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> users() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/bookings")
    public ResponseEntity<Map<String, Object>> bookings() {
        return ResponseEntity.ok(adminService.getAllBookings());
    }

    @PatchMapping("/users/{id}/toggle")
    public ResponseEntity<Map<String, Object>> toggleUser(@PathVariable String id) {
        return ResponseEntity.ok(adminService.toggleUserActive(id));
    }
}
