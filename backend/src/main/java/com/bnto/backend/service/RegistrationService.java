package com.bnto.backend.service;

import com.bnto.backend.dto.RegisterRequest;
import com.bnto.backend.dto.RegisterResponse;
import com.bnto.backend.exception.*;
import com.bnto.backend.model.User;
import com.bnto.backend.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Locale;

@Service
public class RegistrationService {

    private static final int MINIMUM_AGE = 18;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public RegistrationService(UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        // 1. Normalize
        String firstName = request.firstName().trim();
        String lastName = request.lastName().trim();
        String homeAddress = request.homeAddress().trim();
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        String mobileNumber = normalizeMobile(request.mobileNumber());

        // 2. Date of birth 
        LocalDate dateOfBirth = parseDateOfBirth(request.dateOfBirth().trim());

        // 3. Check for Duplicates
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateEmailException();
        }
        if (userRepository.existsByMobileNumber(mobileNumber)) {
            throw new DuplicateMobileNumberException();
        }

        // 4 + 5. Hash and save.
        User user = new User(
                firstName,
                lastName,
                dateOfBirth.toString(), 
                mobileNumber,
                homeAddress,
                email,
                passwordEncoder.encode(request.password()));

        try {
            User saved = userRepository.saveAndFlush(user);
            return new RegisterResponse(saved.getId(), saved.getEmail());
        } catch (DataIntegrityViolationException e) {
            throw new DuplicateUserException("Email or mobile number is already registered");
        }
    }

    private String normalizeMobile(String raw) {
        return raw.trim().replaceAll("[\\s\\-()]", "");
    }

    private LocalDate parseDateOfBirth(String text) {
        LocalDate dob;
        try {
            dob = LocalDate.parse(text); 
        } catch (DateTimeParseException e) {
            throw new InvalidDateOfBirthException("Date of birth is not a valid date");
        }
        LocalDate today = LocalDate.now();
        if (dob.isAfter(today)) {
            throw new InvalidDateOfBirthException("Date of birth cannot be in the future");
        }
        if (dob.isAfter(today.minusYears(MINIMUM_AGE))) {
            throw new InvalidDateOfBirthException("You must be at least " + MINIMUM_AGE + " years old");
        }
        return dob;
    }
}