package com.bnto.backend.service;

import com.bnto.backend.dto.LoginRequest;
import com.bnto.backend.dto.LoginResponse;
import com.bnto.backend.model.User;
import com.bnto.backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Locale;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;

@Service
public class AuthService {

    private static final Duration TOKEN_LIFETIME = Duration.ofHours(1);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.authenticationManager = authenticationManager;
    }

    public Long register(String firstName, String lastName, String dateOfBirth, String mobileNumber, String homeAddress,
            String email, String password) {

        String normalizedEmail = email.trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Email is already registered"
            );
        }

        String passwordHash = passwordEncoder.encode(password);
        
        User user = new User(firstName, lastName, LocalDate.parse(dateOfBirth), mobileNumber, homeAddress, normalizedEmail, passwordHash);

        User savedUser = userRepository.save(user);

        return savedUser.getId();
    }
    public LoginResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);

        // Loads the user via UserDetailsServiceImpl and checks the BCrypt hash. Unknown email and
        // wrong password both surface as BadCredentialsException (Spring hides UsernameNotFound),
        // which GlobalExceptionHandler turns into a generic 401.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.password()));

        // The token's subject is the numeric user id (BudgetController relies on it), which
        // UserDetails doesn't carry, so look the user up once authentication has succeeded.
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("User vanished after authentication"));

        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("bnto-backend")
                .subject(user.getId().toString())
                .issuedAt(now)
                .expiresAt(now.plus(TOKEN_LIFETIME))
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();

        return new LoginResponse(token, TOKEN_LIFETIME.toSeconds());
    }
}