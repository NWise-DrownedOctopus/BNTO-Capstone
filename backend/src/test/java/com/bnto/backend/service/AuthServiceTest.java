package com.bnto.backend.service;

import com.bnto.backend.config.SecurityConfig;
import com.bnto.backend.dto.LoginRequest;
import com.bnto.backend.dto.LoginResponse;
import com.bnto.backend.model.User;
import com.bnto.backend.repository.UserRepository;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.time.Duration;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

/**
 * Only UserRepository is mocked. The AuthenticationManager is the real one from SecurityConfig
 * (real UserDetailsServiceImpl + BCrypt), and tokens are signed with a real HS256 encoder,
 * so these tests exercise the actual login path end to end.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    private static final String EMAIL = "jane@bnto.com";
    private static final String PASSWORD = "password1!";
    private static final long USER_ID = 42L;

    // Low BCrypt cost keeps the tests fast; the algorithm is the same as production.
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(4);
    private final SecretKey key = new SecretKeySpec(new byte[32], "HmacSHA256");
    private final JwtDecoder jwtDecoder = NimbusJwtDecoder.withSecretKey(key)
            .macAlgorithm(MacAlgorithm.HS256).build();

    @Mock
    private UserRepository userRepository;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        AuthenticationManager authenticationManager = new SecurityConfig()
                .authenticationManager(new UserDetailsServiceImpl(userRepository), passwordEncoder);

        authService = new AuthService(
                userRepository,
                passwordEncoder,
                new NimbusJwtEncoder(new ImmutableSecret<>(key)),
                authenticationManager);
    }

    private User storedUser() {
        User user = new User("Jane", "Doe", LocalDate.of(1990, 5, 15), "5550100",
                "123 Main St, Kansas City, MO", EMAIL, passwordEncoder.encode(PASSWORD));
        ReflectionTestUtils.setField(user, "id", USER_ID); // id is DB-generated and has no setter
        return user;
    }

    @Test
    void successReturnsSignedBearerTokenForTheUser() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(storedUser()));

        // Mixed case and padding: login must normalize before looking the user up.
        LoginResponse response = authService.login(new LoginRequest("  Jane@BNTO.com ", PASSWORD));

        assertEquals("Bearer", response.tokenType());
        assertEquals(Duration.ofHours(1).toSeconds(), response.expiresIn());

        Jwt jwt = jwtDecoder.decode(response.token()); // throws if the signature is invalid
        assertEquals(String.valueOf(USER_ID), jwt.getSubject());
        assertEquals("bnto-backend", jwt.getClaimAsString("iss"));
        assertEquals(Duration.ofSeconds(response.expiresIn()),
                Duration.between(jwt.getIssuedAt(), jwt.getExpiresAt()));
    }

    @Test
    void wrongPasswordThrowsBadCredentials() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(storedUser()));

        assertThrows(BadCredentialsException.class,
                () -> authService.login(new LoginRequest(EMAIL, "not-the-password")));
    }

    @Test
    void unknownEmailThrowsBadCredentials() {
        when(userRepository.findByEmail("nobody@bnto.com")).thenReturn(Optional.empty());

        // Same exception type as a wrong password, so the API can't reveal whether an account exists.
        assertThrows(BadCredentialsException.class,
                () -> authService.login(new LoginRequest("nobody@bnto.com", PASSWORD)));
    }
}
