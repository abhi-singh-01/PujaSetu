package com.pujasetu.service;

import com.pujasetu.config.AppProperties;
import com.pujasetu.model.OtpRecord;
import com.pujasetu.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpRepository otpRepository;
    private final AppProperties appProperties;
    private final Random random = new Random();

    public record OtpResult(Instant expiresAt, boolean devMode) {}

    public OtpResult createAndSendOtp(String mobile) {
        String code = appProperties.getOtp().isDevBypass()
                ? appProperties.getOtp().getDevCode()
                : String.format("%06d", 100000 + random.nextInt(900000));

        Instant expiresAt = Instant.now().plusSeconds(appProperties.getOtp().getExpiryMinutes() * 60L);

        otpRepository.deleteByMobile(mobile);
        otpRepository.save(OtpRecord.builder()
                .mobile(mobile)
                .code(code)
                .expiresAt(expiresAt)
                .build());

        sendSms(mobile, code);
        return new OtpResult(expiresAt, appProperties.getOtp().isDevBypass());
    }

    public record VerifyResult(boolean valid, String message) {}

    public VerifyResult verifyOtp(String mobile, String code) {
        List<OtpRecord> records = otpRepository.findByMobileOrderByExpiresAtDesc(mobile);
        if (records.isEmpty()) {
            return new VerifyResult(false, "OTP not found. Request a new one.");
        }

        OtpRecord record = records.getFirst();
        if (record.getExpiresAt().isBefore(Instant.now())) {
            return new VerifyResult(false, "OTP expired");
        }
        if (record.getAttempts() >= 5) {
            return new VerifyResult(false, "Too many attempts");
        }

        boolean devBypass = appProperties.getOtp().isDevBypass()
                && code.equals(appProperties.getOtp().getDevCode());

        if (!devBypass && !record.getCode().equals(code)) {
            record.setAttempts(record.getAttempts() + 1);
            otpRepository.save(record);
            return new VerifyResult(false, "Invalid OTP");
        }

        otpRepository.deleteByMobile(mobile);
        return new VerifyResult(true, "OK");
    }

    private void sendSms(String mobile, String code) {
        var twilio = appProperties.getTwilio();
        if (twilio.getAccountSid() != null && !twilio.getAccountSid().isBlank()) {
            log.info("Twilio SMS would be sent to +91{}", mobile);
            return;
        }
        log.info("[DEV OTP] {}: {}", mobile, code);
    }
}
