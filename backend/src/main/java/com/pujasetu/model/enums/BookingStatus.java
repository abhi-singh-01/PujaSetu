package com.pujasetu.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum BookingStatus {
    PENDING_PAYMENT("pending_payment"),
    CONFIRMED("confirmed"),
    IN_PROGRESS("in_progress"),
    AWAITING_OTP_VERIFICATION("awaiting_otp_verification"),
    READY_FOR_REMAINING_PAYMENT("ready_for_remaining_payment"),
    COMPLETED("completed"),
    CANCELLED("cancelled"),
    REFUNDED("refunded"),
    PENDING("pending"),
    ACCEPTED("accepted"),
    REJECTED("rejected");

    private final String value;

    BookingStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @JsonValue
    public String toJson() {
        return value;
    }

    public static BookingStatus fromValue(String value) {
        for (BookingStatus status : values()) {
            if (status.value.equalsIgnoreCase(value) || status.name().equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid booking status: " + value);
    }
}
