package com.bnto.backend.controller;

import com.bnto.backend.dto.RegisterRequest;
import com.bnto.backend.dto.RegisterResponse;
import com.bnto.backend.service.AuthService;
import com.bnto.backend.service.RegistrationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final RegistrationService registrationService;

    public AuthController(AuthService authService,
        RegistrationService registrationService) {
        this.authService = authService;
        this.registrationService = registrationService;
    }

    public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password) {
        @Override
        public String toString() {
            return "LoginRequest[email=" + email + "]";
        }
    }

    public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn) {
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
        @Valid @RequestBody RegisterRequest request) {
            RegisterResponse response = registrationService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        String token = authService.login(request.email(), request.password());
        return new LoginResponse(token, "Bearer", 3600);
    }
}