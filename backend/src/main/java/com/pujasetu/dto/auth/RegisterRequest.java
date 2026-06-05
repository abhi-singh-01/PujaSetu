package com.pujasetu.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    @Pattern(regexp = "^[6-9]\\d{9}$")
    private String mobile;

    @NotBlank
    @Size(min = 2, max = 100)
    private String name;

    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 100)
    private String password;

    @Pattern(regexp = "customer|pandit|nau")
    private String role;
}
