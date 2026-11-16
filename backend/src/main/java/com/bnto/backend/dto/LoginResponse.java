package com.bnto.backend.dto;

/**
 * Returned by POST /api/auth/login.
 *
 * @param token     the signed JWT; send it back as "Authorization: Bearer &lt;token&gt;"
 * @param tokenType always "Bearer"
 * @param expiresIn seconds until the token expires
 */
public record LoginResponse(String token, String tokenType, long expiresIn) {

    public static final String BEARER = "Bearer";

    public LoginResponse(String token, long expiresIn) {
        this(token, BEARER, expiresIn);
    }
}
