package com.pujasetu.controller;

import com.pujasetu.dto.auth.*;
import com.pujasetu.model.User;
import com.pujasetu.security.SecurityUtils;
import com.pujasetu.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;
    private final SecurityUtils securityUtils;
    private final com.pujasetu.config.AppProperties appProperties;

    @PostMapping("/send-otp")
    @Operation(summary = "Send OTP to mobile number")
    public ResponseEntity<Map<String, Object>> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        return ResponseEntity.ok(authService.sendOtp(request));
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify OTP and login/register")
    public ResponseEntity<Map<String, Object>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(authService.verifyOtp(request));
    }

    @PostMapping("/register")
    @Operation(summary = "Register with password")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(201).body(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with mobile/email and password")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<Map<String, Object>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user")
    public ResponseEntity<Map<String, Object>> getMe() {
        User user = securityUtils.requireCurrentUser().getUser();
        return ResponseEntity.ok(authService.getMe(user));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody Map<String, Object> body) {
        User user = securityUtils.requireCurrentUser().getUser();
        return ResponseEntity.ok(authService.updateProfile(user, body));
    }

    @GetMapping("/digilocker/url")
    public ResponseEntity<Map<String, Object>> digiLockerUrl() {
        User user = securityUtils.requireCurrentUser().getUser();
        if (appProperties.getDigilocker().getClientId() == null
                || appProperties.getDigilocker().getClientId().isBlank()) {
            return ResponseEntity.status(503).body(Map.of("success", false, "message", "DigiLocker not configured"));
        }
        String redirect = java.net.URLEncoder.encode(appProperties.getDigilocker().getRedirectUri(), java.nio.charset.StandardCharsets.UTF_8);
        String url = "https://api.digitallocker.gov.in/public/oauth2/1/authorize?response_type=code&client_id="
                + appProperties.getDigilocker().getClientId() + "&redirect_uri=" + redirect + "&state=" + user.getId();
        return ResponseEntity.ok(Map.of("success", true, "url", url));
    }

    @GetMapping("/digilocker/callback")
    public ResponseEntity<String> digiLockerCallback() {
        return ResponseEntity.ok("<html><body><h2>DigiLocker verification received. You may close this window.</h2></body></html>");
    }
}
