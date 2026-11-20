package com.bnto.backend.controller;

import com.bnto.backend.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    public record AuthRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8) String password
    ) {}

    public record RegisterResponse(Long userId) {}

    public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn
    ) {}

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
            @Valid @RequestBody AuthRequest request
    ) {
        Long userId = authService.register(
            request.email(),
            request.password()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new RegisterResponse(userId));
    }

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody AuthRequest request
    ) {
        String token = authService.login(
            request.email(),
            request.password()
        );

        return new LoginResponse(token, "Bearer", 3600);
    }
}