package com.bnto.backend.dto;

import java.math.BigDecimal;
import java.util.Map;

public record BudgetResponse(
        int periodDays,
        BigDecimal totalIncome,
        BigDecimal totalExpenses,
        BigDecimal remainingIncome,
        Map<String, BigDecimal> expensesByCategory,
        String recommendations
) {
}
