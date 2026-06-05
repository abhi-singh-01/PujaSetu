package com.pujasetu.service;

import com.pujasetu.config.AppProperties;
import com.pujasetu.dto.auth.*;
import com.pujasetu.dto.user.UserResponse;
import com.pujasetu.exception.ApiException;
import com.pujasetu.model.RefreshToken;
import com.pujasetu.model.User;
import com.pujasetu.model.enums.UserRole;
import com.pujasetu.repository.RefreshTokenRepository;
import com.pujasetu.repository.UserRepository;
import com.pujasetu.util.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final OtpService otpService;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final AppProperties appProperties;

    public Map<String, Object> sendOtp(SendOtpRequest request) {
        OtpService.OtpResult result = otpService.createAndSendOtp(request.getMobile());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "OTP sent successfully");
        response.put("expiresAt", result.expiresAt());
        if (result.devMode()) {
            response.put("hint", "Dev mode: use OTP " + appProperties.getOtp().getDevCode());
        }
        return response;
    }

    public Map<String, Object> verifyOtp(VerifyOtpRequest request) {
        OtpService.VerifyResult verification = otpService.verifyOtp(request.getMobile(), request.getOtp());
        if (!verification.valid()) {
            throw new ApiException(verification.message(), 400);
        }

        User user = userRepository.findByMobile(request.getMobile()).orElse(null);
        if (user == null) {
            UserRole role = request.getRole() != null ? UserRole.fromValue(request.getRole()) : UserRole.CUSTOMER;
            user = userRepository.save(User.builder()
                    .mobile(request.getMobile())
                    .name(request.getName() != null ? request.getName() : "User " + request.getMobile().substring(6))
                    .role(role)
                    .build());
        } else if (request.getName() != null) {
            user.setName(request.getName());
            if (request.getRole() != null && user.getRole() != UserRole.ADMIN) {
                user.setRole(UserRole.fromValue(request.getRole()));
            }
            user = userRepository.save(user);
        }

        user.setLastLoginAt(Instant.now());
        user = userRepository.save(user);

        return buildAuthResponse(user, jwtService.generateAccessToken(user.getId()));
    }

    public Map<String, Object> register(RegisterRequest request) {
        if (userRepository.findByMobile(request.getMobile()).isPresent()) {
            throw new ApiException("Mobile already registered", 400);
        }
        if (request.getEmail() != null && userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ApiException("Email already registered", 400);
        }

        UserRole role = request.getRole() != null ? UserRole.fromValue(request.getRole()) : UserRole.CUSTOMER;
        User user = userRepository.save(User.builder()
                .mobile(request.getMobile())
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build());

        return buildTokenPairResponse(user);
    }

    public Map<String, Object> login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        User user = userRepository.findByMobile(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> new ApiException("Invalid credentials", 401));

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);
        return buildTokenPairResponse(user);
    }

    public Map<String, Object> refresh(RefreshTokenRequest request) {
        RefreshToken stored = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new ApiException("Invalid refresh token", 401));
        if (stored.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.delete(stored);
            throw new ApiException("Refresh token expired", 401);
        }
        User user = userRepository.findById(stored.getUserId())
                .orElseThrow(() -> new ApiException("User not found", 401));
        return buildTokenPairResponse(user);
    }

    public Map<String, Object> getMe(User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", UserResponse.from(user));
        return response;
    }

    public Map<String, Object> updateProfile(User user, Map<String, Object> body) {
        if (body.containsKey("name")) user.setName((String) body.get("name"));
        if (body.containsKey("email")) user.setEmail((String) body.get("email"));
        if (body.containsKey("profilePhoto")) user.setProfilePhoto((String) body.get("profilePhoto"));
        if (body.containsKey("fcmToken")) user.setFcmToken((String) body.get("fcmToken"));
        if (body.containsKey("location")) {
            // Jackson will deserialize nested map if sent as UserLocation - handled in controller
        }
        user = userRepository.save(user);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", user);
        return response;
    }

    private Map<String, Object> buildAuthResponse(User user, String token) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("token", token);
        response.put("user", UserResponse.from(user));
        return response;
    }

    private Map<String, Object> buildTokenPairResponse(User user) {
        refreshTokenRepository.deleteByUserId(user.getId());
        String accessToken = jwtService.generateAccessToken(user.getId());
        String refreshValue = jwtService.generateRefreshTokenValue();
        refreshTokenRepository.save(RefreshToken.builder()
                .userId(user.getId())
                .token(refreshValue)
                .expiresAt(jwtService.refreshTokenExpiry().toInstant())
                .build());

        Map<String, Object> response = buildAuthResponse(user, accessToken);
        response.put("refreshToken", refreshValue);
        return response;
    }
}
