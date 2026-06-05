package com.pujasetu.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum UserRole {
    CUSTOMER("customer", "ROLE_USER"),
    PANDIT("pandit", "ROLE_PANDIT"),
    NAI("nau", "ROLE_NAI"),
    ADMIN("admin", "ROLE_ADMIN");

    private final String value;
    private final String authority;

    @JsonValue
    public String toJson() {
        return value;
    }

    public static UserRole fromValue(String value) {
        if (value == null) {
            return CUSTOMER;
        }
        for (UserRole role : values()) {
            if (role.value.equalsIgnoreCase(value) || role.name().equalsIgnoreCase(value)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Invalid role: " + value);
    }
}
