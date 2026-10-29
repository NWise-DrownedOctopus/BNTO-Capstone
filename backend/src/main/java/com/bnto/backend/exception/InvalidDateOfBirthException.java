package com.bnto.backend.exception;

public class InvalidDateOfBirthException extends RuntimeException {
    public InvalidDateOfBirthException(String message) {
        super(message);
    }
}
