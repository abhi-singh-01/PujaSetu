package com.pujasetu.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pujasetu.model.enums.BookingStatus;
import com.pujasetu.model.enums.BookingType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {

    @Id
    @JsonProperty("_id")
    private String id;

    @Indexed
    @Field("customer")
    @JsonProperty("customer")
    private String customerId;

    @Indexed
    @Field("provider")
    @JsonProperty("provider")
    private String providerId;

    private BookingType bookingType;
    private String eventType;
    private Instant scheduledDate;
    private String startTime;
    private Integer durationHours;
    private Integer durationDays;
    private BookingAddress address;
    private String specialInstructions;

    private int amount;
    private int advanceAmount;
    private int remainingAmount;

    @Builder.Default
    private int advancePercent = 15;

    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING_PAYMENT;

    private PaymentInfo payment;
    private CompletionOtp completionOtp;
    private String cancelledBy;
    private String cancellationReason;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingAddress {
        private String line1;
        private String line2;
        private String city;
        private String state;
        private String district;
        private String pincode;
        private Coordinates coordinates;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Coordinates {
        private Double lat;
        private Double lng;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentInfo {
        private String advanceOrderId;
        private String advancePaymentId;
        private boolean advancePaid = false;
        private String remainingOrderId;
        private String remainingPaymentId;
        private boolean remainingPaid = false;
        private boolean remainingPaymentUnlocked = false;
        private String receiptNumber;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompletionOtp {
        private String code;
        private Instant expiresAt;
        private Instant generatedAt;
        private boolean customerVerified = false;
        private boolean providerVerified = false;
        private Instant customerVerifiedAt;
        private Instant providerVerifiedAt;
    }
}
