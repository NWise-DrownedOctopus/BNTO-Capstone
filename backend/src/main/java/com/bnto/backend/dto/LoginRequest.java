package com.bnto.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(

        @NotBlank(message = "Email is required") @Email(message = "Email must be a valid address") String email,

        @NotBlank(message = "Password is required") String password) {

    // Leave the password out so it never ends up in logs.
    @Override
    public String toString() {
        return "LoginRequest[email=" + email + "]";
    }
}
