package com.bnto.backend.controller;

import com.bnto.backend.dto.BudgetResponse;
import com.bnto.backend.service.BudgetService;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

import java.math.BigDecimal;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class BudgetControllerTest {

    @Test
    void generateBudgetUsesAuthenticatedUserId() {

        // Arrange: create a mock budget service
        BudgetService budgetService = mock(BudgetService.class);

        BudgetController controller = new BudgetController(budgetService);

        // Simulate a validated JWT belonging to user 22
        Jwt jwt = Jwt.withTokenValue("test-token")
            .header("alg", "HS256")
            .subject("22")
            .build();

        // Create a sample structured budget response
        BudgetResponse expectedResponse = new BudgetResponse(
            30,
            new BigDecimal("4200.00"),
            new BigDecimal("2850.00"),
            new BigDecimal("1350.00"),
            Map.of("Groceries", new BigDecimal("450.00")),
            "Review your grocery spending."
        );

        when(budgetService.generateBudget(22L))
            .thenReturn(expectedResponse);

        // Act: call the controller
        BudgetResponse result = controller.generateBudget(jwt);

        // Assert: the controller returns the expected response
        assertEquals(expectedResponse, result);

        // Verify the authenticated user's ID was used
        verify(budgetService).generateBudget(22L);
        verifyNoMoreInteractions(budgetService);
    }
}
