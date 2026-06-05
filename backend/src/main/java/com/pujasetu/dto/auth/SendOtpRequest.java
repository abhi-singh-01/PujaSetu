package com.pujasetu.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SendOtpRequest {

    @NotBlank
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Valid 10-digit Indian mobile required")
    private String mobile;
}
