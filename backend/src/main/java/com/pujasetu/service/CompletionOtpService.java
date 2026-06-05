package com.pujasetu.service;

import com.pujasetu.config.AppProperties;
import com.pujasetu.model.Booking;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class CompletionOtpService {

    private final AppProperties appProperties;
    private final Random random = new Random();

    public Booking.CompletionOtp buildCompletionOtpPayload() {
        String code = String.format("%06d", 100000 + random.nextInt(900000));
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(appProperties.getPayment().getCompletionOtpExpiryMinutes() * 60L);
        return Booking.CompletionOtp.builder()
                .code(code)
                .generatedAt(now)
                .expiresAt(expiresAt)
                .customerVerified(false)
                .providerVerified(false)
                .build();
    }

    public record VerifyResult(boolean valid, boolean bothVerified, String message) {}

    public VerifyResult verifyCompletionOtpCode(Booking booking, String otp, String role) {
        Booking.CompletionOtp record = booking.getCompletionOtp();
        if (record == null || record.getCode() == null) {
            return new VerifyResult(false, false, "Completion OTP not generated. Provider must mark service complete.");
        }
        if (record.getExpiresAt().isBefore(Instant.now())) {
            return new VerifyResult(false, false, "Completion OTP expired. Ask provider to regenerate.");
        }

        boolean devBypass = appProperties.getOtp().isDevBypass()
                && otp.equals(appProperties.getOtp().getDevCode());

        if (!devBypass && !record.getCode().equals(otp)) {
            return new VerifyResult(false, false, "Invalid OTP. Confirm with your service provider.");
        }

        if ("customer".equals(role)) {
            record.setCustomerVerified(true);
            record.setCustomerVerifiedAt(Instant.now());
        } else if ("provider".equals(role)) {
            record.setProviderVerified(true);
            record.setProviderVerifiedAt(Instant.now());
        } else {
            return new VerifyResult(false, false, "Invalid role");
        }

        boolean bothVerified = record.isCustomerVerified() && record.isProviderVerified();
        String message = bothVerified
                ? "Both parties verified. Remaining payment is now unlocked."
                : ("customer".equals(role) ? "Customer" : "Provider") + " verified. Waiting for "
                + ("customer".equals(role) ? "provider" : "customer") + " confirmation.";

        return new VerifyResult(true, bothVerified, message);
    }
}
