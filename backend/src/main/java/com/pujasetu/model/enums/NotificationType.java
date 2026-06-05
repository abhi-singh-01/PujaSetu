package com.pujasetu.model.enums;

public enum NotificationType {
    BOOKING("booking"),
    PAYMENT("payment"),
    APPROVAL("approval"),
    REMINDER("reminder"),
    GENERAL("general");

    private final String value;

    NotificationType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
