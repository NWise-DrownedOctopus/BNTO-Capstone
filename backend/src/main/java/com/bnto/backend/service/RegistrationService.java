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
                dateOfBirth,
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

    /**
     * Strips whitespace, dashes and parentheses. A leading "+" is allowed only
     * for the US country code (+1) and is discarded, so "+1 (816) 555-0100"
     * becomes "18165550100". Any other country code is rejected.
     */
    private String normalizeMobile(String raw) {
        String digits = raw.trim().replaceAll("[\\s\\-()]", "");
        if (digits.startsWith("+")) {
            if (!digits.startsWith("+1")) {
                throw new InvalidMobileNumberException("Only US (+1) mobile numbers are supported");
            }
            digits = digits.substring(1);
        }
        if (digits.contains("+")) {
            throw new InvalidMobileNumberException("Mobile number contains invalid characters");
        }
        return digits;
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