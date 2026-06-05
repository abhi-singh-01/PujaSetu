package com.pujasetu.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "pujasetu")
public class AppProperties {

    private Jwt jwt = new Jwt();
    private Otp otp = new Otp();
    private Payment payment = new Payment();
    private Cors cors = new Cors();
    private Razorpay razorpay = new Razorpay();
    private Cloudinary cloudinary = new Cloudinary();
    private Firebase firebase = new Firebase();
    private Digilocker digilocker = new Digilocker();
    private Twilio twilio = new Twilio();
    private Seed seed = new Seed();

    @Data
    public static class Jwt {
        private String secret;
        private long accessExpirationMs;
        private long refreshExpirationMs;
    }

    @Data
    public static class Otp {
        private int expiryMinutes;
        private boolean devBypass;
        private String devCode;
    }

    @Data
    public static class Payment {
        private int advancePercent;
        private int completionOtpExpiryMinutes;
    }

    @Data
    public static class Cors {
        private String allowedOrigins;
    }

    @Data
    public static class Razorpay {
        private String keyId;
        private String keySecret;
    }

    @Data
    public static class Cloudinary {
        private String cloudName;
        private String apiKey;
        private String apiSecret;
    }

    @Data
    public static class Firebase {
        private String credentialsPath;
    }

    @Data
    public static class Digilocker {
        private String clientId;
        private String clientSecret;
        private String redirectUri;
    }

    @Data
    public static class Twilio {
        private String accountSid;
        private String authToken;
        private String phoneNumber;
    }

    @Data
    public static class Seed {
        private boolean enabled;
    }
}
