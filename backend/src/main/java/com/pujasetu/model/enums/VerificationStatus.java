package com.pujasetu.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum VerificationStatus {
    PENDING("pending"),
    APPROVED("approved"),
    REJECTED("rejected");

    private final String value;

    VerificationStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @JsonValue
    public String toJson() {
        return value;
    }

    public static VerificationStatus fromValue(String value) {
        for (VerificationStatus status : values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid verification status: " + value);
    }
}
