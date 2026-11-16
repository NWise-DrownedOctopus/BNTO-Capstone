package com.bnto.backend.exception;

public class InvalidMobileNumberException extends RuntimeException {
    public InvalidMobileNumberException(String message) {
        super(message);
    }
}
