package com.bnto.backend.service;

import com.bnto.backend.model.User;
import com.bnto.backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtEncoder jwtEncoder
) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtEncoder = jwtEncoder;
}

    public Long register(String email, String password) {

        String normalizedEmail = email.trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Email is already registered"
            );
        }

        String passwordHash = passwordEncoder.encode(password);

        User user = new User(normalizedEmail, passwordHash);

        User savedUser = userRepository.save(user);

        return savedUser.getId();
    }
    public String login(String email, String password) {

    String normalizedEmail = email.trim().toLowerCase();

    User user = userRepository.findByEmail(normalizedEmail)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.UNAUTHORIZED,
            "Invalid email or password"
        ));

    if (!passwordEncoder.matches(password, user.getPasswordHash())) {
        throw new ResponseStatusException(
            HttpStatus.UNAUTHORIZED,
            "Invalid email or password"
        );
    }

    Instant now = Instant.now();
    Instant expiresAt = now.plus(1, ChronoUnit.HOURS);

    JwtClaimsSet claims = JwtClaimsSet.builder()
        .issuer("bnto-backend")
        .subject(user.getId().toString())
        .issuedAt(now)
        .expiresAt(expiresAt)
        .build();

    JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();

    return jwtEncoder.encode(
        JwtEncoderParameters.from(header, claims)
    ).getTokenValue();
    }
}