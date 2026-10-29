package com.bnto.backend;

import com.bnto.backend.service.RegistrationService;
import com.bnto.backend.dto.RegisterRequest;
import com.bnto.backend.dto.RegisterResponse;
import com.bnto.backend.exception.*;
import com.bnto.backend.model.User;
import com.bnto.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegistrationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private RegistrationService registrationService;

    private RegisterRequest request(String email, String mobile, String dob) {
        return new RegisterRequest(
                "  Jane ", "Doe", dob, mobile,
                "123 Main St, Kansas City, MO", email, "password1!");
    }

    private String validDob() {
        return LocalDate.now().minusYears(30).toString();
    }

    @Test
    void successfulRegistrationStoresHashedPasswordAndNormalizedFields() {
        when(passwordEncoder.encode("password1!")).thenReturn("HASHED");
        when(userRepository.saveAndFlush(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RegisterResponse response = registrationService.register(
                request("  Jane@BNTO.com ", "(555) 010-0100", validDob()));

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).saveAndFlush(captor.capture());
        User saved = captor.getValue();

        assertEquals("jane@bnto.com", saved.getEmail());
        assertEquals("5550100100", saved.getMobileNumber());
        assertEquals("Jane", saved.getFirstName());
        assertEquals("HASHED", saved.getPasswordHash());
        assertNotEquals("password1!", saved.getPasswordHash());
        assertEquals("jane@bnto.com", response.email());
        verify(passwordEncoder).encode("password1!");
    }

    @Test
    void duplicateEmailThrowsAndSavesNothing() {
        when(userRepository.existsByEmail("jane@bnto.com")).thenReturn(true);

        assertThrows(DuplicateEmailException.class,
                () -> registrationService.register(request("jane@bnto.com", "555-0100", validDob())));

        verify(userRepository, never()).saveAndFlush(any());
    }

    @Test
    void duplicateMobileNumberThrowsAndSavesNothing() {
        when(userRepository.existsByMobileNumber("5550100")).thenReturn(true);

        assertThrows(DuplicateMobileNumberException.class,
                () -> registrationService.register(request("jane@bnto.com", "555-0100", validDob())));

        verify(userRepository, never()).saveAndFlush(any());
    }

    @Test
    void impossibleDateOfBirthIsRejected() {
        assertThrows(InvalidDateOfBirthException.class,
                () -> registrationService.register(request("jane@bnto.com", "555-0100", "2025-02-31")));

        verifyNoInteractions(userRepository);
    }

    @Test
    void futureDateOfBirthIsRejected() {
        String future = LocalDate.now().plusDays(1).toString();

        assertThrows(InvalidDateOfBirthException.class,
                () -> registrationService.register(request("jane@bnto.com", "555-0100", future)));
    }

    @Test
    void underageDateOfBirthIsRejected() {
        String tooYoung = LocalDate.now().minusYears(17).toString();

        assertThrows(InvalidDateOfBirthException.class,
                () -> registrationService.register(request("jane@bnto.com", "555-0100", tooYoung)));
    }

    @Test
    void dataIntegrityViolationOnSaveBecomesDuplicateError() {
        when(passwordEncoder.encode(any())).thenReturn("HASHED");
        when(userRepository.saveAndFlush(any(User.class)))
                .thenThrow(new DataIntegrityViolationException("unique constraint"));

        assertThrows(DuplicateUserException.class,
                () -> registrationService.register(request("jane@bnto.com", "555-0100", validDob())));
    }
}
