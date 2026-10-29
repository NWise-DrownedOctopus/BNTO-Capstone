package com.bnto.backend.exception;

public class DuplicateEmailException extends DuplicateUserException {
    public DuplicateEmailException() {
        super("Email is already registered");
    }
}
