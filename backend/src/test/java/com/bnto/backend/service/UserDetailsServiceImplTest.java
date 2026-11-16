package com.bnto.backend.service;

import com.bnto.backend.model.User;
import com.bnto.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {

    private static final String EMAIL = "jane@bnto.com";
    private static final String PASSWORD_HASH = "$2a$10$hashedPassword";

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    private User storedUser() {
        return new User("Jane", "Doe", LocalDate.of(1990, 5, 15), "5550100",
                "123 Main St, Kansas City, MO", EMAIL, PASSWORD_HASH);
    }

    @Test
    void userFoundReturnsDetailsWithEmailAndPasswordHash() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(storedUser()));

        UserDetails details = userDetailsService.loadUserByUsername(EMAIL);

        assertEquals(EMAIL, details.getUsername());
        assertEquals(PASSWORD_HASH, details.getPassword());
        assertTrue(details.getAuthorities().isEmpty());
    }

    @Test
    void userNotFoundThrowsUsernameNotFoundException() {
        when(userRepository.findByEmail("nobody@bnto.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> userDetailsService.loadUserByUsername("nobody@bnto.com"));
    }

    @Test
    void emailCaseIsIgnored() {
        // Only the lowercase email is stubbed; any other lookup returns empty and the test fails.
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(storedUser()));

        UserDetails details = userDetailsService.loadUserByUsername("Jane@BNTO.com");

        assertEquals(EMAIL, details.getUsername());
    }
}
