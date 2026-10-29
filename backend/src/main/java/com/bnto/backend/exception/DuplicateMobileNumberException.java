package com.bnto.backend.exception;

public class DuplicateMobileNumberException extends DuplicateUserException {
    public DuplicateMobileNumberException() {
        super("Mobile number is already registered");
    }
}
