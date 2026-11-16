package com.bnto.backend.controller;

import com.bnto.backend.dto.LoginRequest;
import com.bnto.backend.dto.LoginResponse;
import com.bnto.backend.dto.RegisterResponse;
import com.bnto.backend.service.AuthService;
import com.bnto.backend.service.RegistrationService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerTest {

    private final RegistrationService registrationService = mock(RegistrationService.class);
    private final AuthService authService = mock(AuthService.class);

    private final MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(new AuthController(authService, registrationService))
            .build();

    private static final String VALID_REGISTER_JSON = """
            {
              "firstName": "Jane",
              "lastName": "Doe",
              "dateOfBirth": "1990-05-15",
              "mobileNumber": "555-0100",
              "homeAddress": "123 Main St, Kansas City, MO",
              "email": "jane@bnto.com",
              "password": "password1!"
            }
            """;

    private static final String VALID_LOGIN_JSON = """
            {
              "email": "jane@bnto.com",
              "password": "password1!"
            }
            """;

    // Register Test  

    @Test
    void registerWithValidRequestReturns201WithIdAndEmailOnly() throws Exception {
        when(registrationService.register(any()))
                .thenReturn(new RegisterResponse(1L, "jane@bnto.com"));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(VALID_REGISTER_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("jane@bnto.com"))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andExpect(content().string(not(containsString("password1!"))));
    }

    @Test
    void registerWithInvalidRequestReturns400AndNeverCallsService() throws Exception {
        String blankFirstName = VALID_REGISTER_JSON.replace("\"Jane\"", "\"   \"");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(blankFirstName))
                .andExpect(status().isBadRequest());

        verify(registrationService, never()).register(any());
    }

    @Test
    void registerWithShortPasswordReturns400() throws Exception {
        String shortPassword = VALID_REGISTER_JSON.replace("password1!", "short");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(shortPassword))
                .andExpect(status().isBadRequest());

        verify(registrationService, never()).register(any());
    }

    // Login Tests
    @Test
    void loginWithOnlyEmailAndPasswordReturns200WithToken() throws Exception {
        when(authService.login(new LoginRequest("jane@bnto.com", "password1!")))
                .thenReturn(new LoginResponse("fake-jwt", 3600));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(VALID_LOGIN_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("fake-jwt"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value(3600));
    }

    @Test
    void loginWithBlankEmailReturns400AndNeverCallsService() throws Exception {
        String blankEmail = VALID_LOGIN_JSON.replace("jane@bnto.com", "");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(blankEmail))
                .andExpect(status().isBadRequest());

        verify(authService, never()).login(any());
    }
}