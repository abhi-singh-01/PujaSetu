package com.pujasetu.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pujasetu.model.enums.ProviderType;
import com.pujasetu.model.enums.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "providers")
public class Provider {

    @Id
    @JsonProperty("_id")
    private String id;

    @Indexed(unique = true)
    @Field("user")
    @JsonProperty("user")
    private String userId;

    private ProviderType providerType;
    private String fullName;
    private String mobile;
    private String profilePhoto;

    @Builder.Default
    private int experienceYears = 0;

    @Builder.Default
    private List<String> languages = new ArrayList<>();

    @Builder.Default
    private List<String> services = new ArrayList<>();

    private Charges charges;

    @Builder.Default
    private List<ServicePricing> servicePricing = new ArrayList<>();

    private ProviderLocation location;

    @Builder.Default
    private List<ProviderDocument> documents = new ArrayList<>();

    @Builder.Default
    private boolean digiLockerVerified = false;

    private String digiLockerId;

    @Builder.Default
    private List<AvailabilitySlot> availability = new ArrayList<>();

    @Builder.Default
    private double rating = 0;

    @Builder.Default
    private int reviewCount = 0;

    @Builder.Default
    private boolean isVerified = false;

    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    private String rejectionReason;
    private String bio;

    @Builder.Default
    private boolean isActive = true;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Charges {
        private int hourly;
        private int halfDay;
        private int fullDay;
        private int multiDay;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServicePricing {
        private String serviceName;
        private int hourly;
        private int halfDay;
        private int fullDay;
        private int multiDay;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProviderLocation {
        private String state;
        private String district;
        private String city;
        @GeoSpatialIndexed
        private GeoPoint coordinates;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GeoPoint {
        private String type = "Point";
        private List<Double> coordinates;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProviderDocument {
        private String type;
        private String documentNumber;
        private String documentUrl;
        private boolean verified = false;
        private Instant verifiedAt;
        private String verifiedBy;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AvailabilitySlot {
        private Instant date;
        private boolean isAvailable = true;
        private List<TimeSlot> slots;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSlot {
        private String start;
        private String end;
    }
}
