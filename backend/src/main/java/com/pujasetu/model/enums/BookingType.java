package com.pujasetu.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum BookingType {
    HOURLY("hourly"),
    HALF_DAY("half_day"),
    FULL_DAY("full_day"),
    MULTI_DAY("multi_day");

    private final String value;

    BookingType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @JsonValue
    public String toJson() {
        return value;
    }

    public static BookingType fromValue(String value) {
        for (BookingType type : values()) {
            if (type.value.equalsIgnoreCase(value) || type.name().equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid booking type: " + value);
    }
}
