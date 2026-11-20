package com.bnto.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private JwtEncoder jwtEncoder;

    @Test
    void budgetEndpointRejectsUnauthenticatedRequests() throws Exception {
        mockMvc.perform(post("/api/budget/generate"))
            .andExpect(status().isUnauthorized());
    }
    @Test
    void budgetEndpointAcceptsValidJwt() throws Exception {

    Instant now = Instant.now();

    JwtClaimsSet claims = JwtClaimsSet.builder()
        .issuer("bnto-backend")
        .subject("999999")
        .issuedAt(now)
        .expiresAt(now.plus(1, ChronoUnit.HOURS))
        .build();

    JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();

    String token = jwtEncoder.encode(
        JwtEncoderParameters.from(header, claims)
    ).getTokenValue();

    mockMvc.perform(
            post("/api/budget/generate")
                .header("Authorization", "Bearer " + token)
        )
        .andExpect(status().isOk())
        .andExpect(content().string("No accounts were found for this user."));
    }
    @Test
    void budgetEndpointRejectsInvalidJwt() throws Exception {
        mockMvc.perform(
                post("/api/budget/generate")
                    .header("Authorization", "Bearer invalid-token")
            )
            .andExpect(status().isUnauthorized());
    }
}