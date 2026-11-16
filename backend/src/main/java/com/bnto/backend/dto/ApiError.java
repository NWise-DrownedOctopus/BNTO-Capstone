package com.bnto.backend.dto;

import java.time.Instant;
import java.util.Map;

/**
 * Shared error body for API responses.
 *
 * @param status      HTTP status code, e.g. 400
 * @param error       HTTP reason phrase, e.g. "Bad Request"
 * @param message     human-readable description of what went wrong
 * @param fieldErrors per-field validation messages keyed by field name; empty when not applicable
 * @param timestamp   when the error occurred
 */
public record ApiError(
        int status,
        String error,
        String message,
        Map<String, String> fieldErrors,
        Instant timestamp) {

    public ApiError {
        fieldErrors = fieldErrors == null ? Map.of() : Map.copyOf(fieldErrors);
    }
}
