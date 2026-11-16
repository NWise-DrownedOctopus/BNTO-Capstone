package com.bnto.backend.controller;

import com.bnto.backend.config.SecurityConfig;
import com.bnto.backend.dto.LoginRequest;
import com.bnto.backend.dto.LoginResponse;
import com.bnto.backend.dto.RegisterResponse;
import com.bnto.backend.exception.DuplicateEmailException;
import com.bnto.backend.exception.DuplicateMobileNumberException;
import com.bnto.backend.exception.InvalidDateOfBirthException;
import com.bnto.backend.service.AuthService;
import com.bnto.backend.service.RegistrationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.aMapWithSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class) 
class AuthControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RegistrationService registrationService;

    @MockitoBean
    private AuthService authService;

    // SecurityConfig's JWT resource server needs a decoder; the real one requires JWT_SECRET. 
    @MockitoBean
    private JwtDecoder jwtDecoder;

    // SecurityConfig's AuthenticationManager needs one; @WebMvcTest doesn't load @Service beans.
    @MockitoBean
    private UserDetailsService userDetailsService;

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

    @Test
    void registerSuccessReturns201WithIdAndEmail() throws Exception {
        when(registrationService.register(any()))
                .thenReturn(new RegisterResponse(1L, "jane@bnto.com"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_REGISTER_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("jane@bnto.com"));
    }

    // Validation: each request breaks exactly one rule, so fieldErrors must contain only that field.

    @Test
    void registerMissingFieldReturns400WithFieldError() throws Exception {
        String missingFirstName = VALID_REGISTER_JSON.replace("\"firstName\": \"Jane\",", "");

        expectSingleFieldError(missingFirstName, "firstName", "First name is required");
    }

    @Test
    void registerBadEmailReturns400WithFieldError() throws Exception {
        String badEmail = VALID_REGISTER_JSON.replace("jane@bnto.com", "not-an-email");

        expectSingleFieldError(badEmail, "email", "Email must be a valid address");
    }

    @Test
    void registerShortPasswordReturns400WithFieldError() throws Exception {
        String shortPassword = VALID_REGISTER_JSON.replace("password1!", "short");

        expectSingleFieldError(shortPassword, "password", "Password must be between 8 and 72 characters");
    }

    // Conflicts: the service rejects the user; GlobalExceptionHandler must turn that into 409.

    @Test
    void registerDuplicateEmailReturns409() throws Exception {
        when(registrationService.register(any())).thenThrow(new DuplicateEmailException());

        expectConflict("Email is already registered");
    }

    @Test
    void registerDuplicateMobileNumberReturns409() throws Exception {
        when(registrationService.register(any())).thenThrow(new DuplicateMobileNumberException());

        expectConflict("Mobile number is already registered");
    }

    // Bad date of birth: the age rules live in RegistrationService (covered by RegistrationServiceTest).
    // Here the mocked service throws, and we check the exception becomes a 400.

    @Test
    void registerUnderageDateOfBirthReturns400() throws Exception {
        String underage = LocalDate.now().minusYears(17).toString();
        when(registrationService.register(any()))
                .thenThrow(new InvalidDateOfBirthException("You must be at least 18 years old"));

        expectBadDateOfBirth(underage, "You must be at least 18 years old");
    }

    @Test
    void registerFutureDateOfBirthReturns400() throws Exception {
        String future = LocalDate.now().plusDays(1).toString();
        when(registrationService.register(any()))
                .thenThrow(new InvalidDateOfBirthException("Date of birth cannot be in the future"));

        expectBadDateOfBirth(future, "Date of birth cannot be in the future");
    }

    // Login

    @Test
    void loginSuccessReturns200WithToken() throws Exception {
        when(authService.login(new LoginRequest("jane@bnto.com", "password1!")))
                .thenReturn(new LoginResponse("fake-jwt", 3600));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "email": "jane@bnto.com", "password": "password1!" }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("fake-jwt"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value(3600));
    }

    @Test
    void loginInvalidBodyReturns400WithFieldErrorsAndNeverCallsService() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "email": "not-an-email", "password": "" }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors", aMapWithSize(2)))
                .andExpect(jsonPath("$.fieldErrors.email").value("Email must be a valid address"))
                .andExpect(jsonPath("$.fieldErrors.password").value("Password is required"));

        verify(authService, never()).login(any());
    }

    // Bad credentials must give a 401 that doesn't reveal whether the account exists.
    @Test
    void loginBadCredentialsReturns401WithGenericMessage() throws Exception {
        when(authService.login(any()))
                .thenThrow(new BadCredentialsException("internal detail that must not leak"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "email": "nobody@bnto.com", "password": "wrong-password" }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    private void expectBadDateOfBirth(String dateOfBirth, String message) throws Exception {
        String json = VALID_REGISTER_JSON.replace("1990-05-15", dateOfBirth);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value(message));
    }

    private void expectConflict(String message) throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_REGISTER_JSON))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value(message));
    }

    private void expectSingleFieldError(String json, String field, String message) throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors", aMapWithSize(1)))
                .andExpect(jsonPath("$.fieldErrors." + field).value(message));

        verify(registrationService, never()).register(any());
    }
}
