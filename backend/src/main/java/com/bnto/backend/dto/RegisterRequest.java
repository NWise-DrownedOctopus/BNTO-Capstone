package com.bnto.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "First name is required") @Size(max = 100, message = "First name must be 100 characters or fewer") String firstName,

        @NotBlank(message = "Last name is required") @Size(max = 100, message = "Last name must be 100 characters or fewer") String lastName,

        @NotBlank(message = "Date of birth is required") @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Date of birth must be in yyyy-MM-dd format") String dateOfBirth,

        @NotBlank(message = "Mobile number is required") @Pattern(regexp = "^[0-9+()\\-\\s]{7,20}$", message = "Mobile number contains invalid characters") String mobileNumber,

        @NotBlank(message = "Home address is required") @Size(max = 255, message = "Home address must be 255 characters or fewer") String homeAddress,

        @NotBlank(message = "Email is required") @Email(message = "Email must be a valid address") @Size(max = 255, message = "Email must be 255 characters or fewer") String email,

        @NotBlank(message = "Password is required") @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters") String password) {
    // Removing password from the default toString call just in case
    @Override
    public String toString() {
        return "RegisterRequest[email=" + email + "]";
    }
}