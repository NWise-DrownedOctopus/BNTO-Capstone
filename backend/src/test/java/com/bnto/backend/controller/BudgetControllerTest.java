package com.bnto.backend.controller;

import com.bnto.backend.service.BudgetService;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

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

        when(budgetService.generateBudget(22L))
            .thenReturn("Budget for user 22");

        // Act: call the controller
        String result = controller.generateBudget(jwt);

        // Assert: the correct user's budget was requested
        assertEquals("Budget for user 22", result);

        verify(budgetService).generateBudget(22L);
        verifyNoMoreInteractions(budgetService);
    }
}
