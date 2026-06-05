package com.pujasetu.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pujasetu.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    @JsonProperty("_id")
    private String id;

    @Indexed(unique = true)
    private String mobile;

    private String name;
    private String email;

    @Builder.Default
    private UserRole role = UserRole.CUSTOMER;

    private String passwordHash;
    private String profilePhoto;

    @Builder.Default
    private boolean isVerified = false;

    private String fcmToken;
    private UserLocation location;

    @Builder.Default
    private boolean isActive = true;

    private Instant lastLoginAt;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserLocation {
        private String state;
        private String district;
        private String city;
        private GeoPoint coordinates;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GeoPoint {
        private String type = "Point";
        private List<Double> coordinates;
    }
}
