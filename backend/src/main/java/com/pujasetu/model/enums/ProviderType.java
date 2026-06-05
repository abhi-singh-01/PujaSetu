package com.pujasetu.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ProviderType {
    PANDIT("pandit"),
    NAI("nau");

    private final String value;

    ProviderType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @JsonValue
    public String toJson() {
        return value;
    }

    public static ProviderType fromValue(String value) {
        for (ProviderType type : values()) {
            if (type.value.equalsIgnoreCase(value) || type.name().equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid provider type: " + value);
    }
}
