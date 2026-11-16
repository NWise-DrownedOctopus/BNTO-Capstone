package com.bnto.backend.exception;

import com.bnto.backend.dto.ApiError;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Covers DuplicateEmailException and DuplicateMobileNumberException
    @ExceptionHandler(DuplicateUserException.class)
    public ResponseEntity<ApiError> handleDuplicateUser(DuplicateUserException ex) {
        return build(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(InvalidDateOfBirthException.class)
    public ResponseEntity<ApiError> handleInvalidDateOfBirth(InvalidDateOfBirthException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        // A field can fail several constraints at once; keep only the first message per field.
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            String message = error.getDefaultMessage() != null ? error.getDefaultMessage() : "Invalid value";
            fieldErrors.putIfAbsent(error.getField(), message);
        }
        return build(HttpStatus.BAD_REQUEST, "Validation failed", fieldErrors);
    }

    // Fixed message on purpose: the exception's own message exposes parser and class internals.
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleMalformedJson(HttpMessageNotReadableException ex) {
        return build(HttpStatus.BAD_REQUEST, "Request body is missing or malformed");
    }

    private ResponseEntity<ApiError> build(HttpStatus status, String message) {
        return build(status, message, Map.of());
    }

    private ResponseEntity<ApiError> build(HttpStatus status, String message, Map<String, String> fieldErrors) {
        ApiError body = new ApiError(
                status.value(),
                status.getReasonPhrase(),
                message,
                fieldErrors,
                Instant.now());
        return ResponseEntity.status(status).body(body);
    }
}
