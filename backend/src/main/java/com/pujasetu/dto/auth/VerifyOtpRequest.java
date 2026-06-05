package com.pujasetu.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VerifyOtpRequest {

    @NotBlank
    @Pattern(regexp = "^[6-9]\\d{9}$")
    private String mobile;

    @NotBlank
    @Size(min = 4, max = 6)
    private String otp;

    private String name;

    @Pattern(regexp = "customer|pandit|nau")
    private String role;
}
