package com.bnto.backend.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import java.time.LocalDateTime;
import com.bnto.backend.dto.BudgetResponse;
import org.springframework.stereotype.Service;

import com.bnto.backend.model.Account;
import com.bnto.backend.model.BankTransaction;
import com.bnto.backend.repository.AccountRepository;
import com.bnto.backend.repository.TransactionRepository;

@Service
public class BudgetService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final OllamaService ollamaService;

    public BudgetService(
            AccountRepository accountRepository,
            TransactionRepository transactionRepository,
            OllamaService ollamaService) {

        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.ollamaService = ollamaService;
    }

    public BudgetResponse generateBudget(Long userId) {

        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(30);

        List<Account> accounts = accountRepository.findByUserId(userId);

        if (accounts.isEmpty()) {
            return new BudgetResponse(
                    30,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    Map.of(),
                    "No accounts were found for this user."
            );
}

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;

        int transactionCount = 0;

        Map<String, BigDecimal> expensesByCategory = new HashMap<>();

        for (Account account : accounts) {

            List<BankTransaction> transactions =
                transactionRepository.findByAccountIdAndTransactionDateBetween(
                        account.getId(),
                        startDate,
                        endDate
        );

            
        for (BankTransaction transaction : transactions) {

            String category = transaction.getCategory();

            // Exclude only transactions explicitly marked as internal transfers.
            if (category != null &&
                    category.trim().equalsIgnoreCase("Internal Transfer")) {
                continue;
            }

            BigDecimal amount = transaction.getAmount();

            if (amount == null) {
                continue;
            }

            transactionCount++;

            if (amount.compareTo(BigDecimal.ZERO) > 0) {

                totalIncome = totalIncome.add(amount);

            } else if (amount.compareTo(BigDecimal.ZERO) < 0) {

                BigDecimal expense = amount.abs();

                totalExpenses = totalExpenses.add(expense);

                String expenseCategory =
                        category == null || category.isBlank()
                                ? "Uncategorized"
                                : category;

                expensesByCategory.merge(
                        expenseCategory,
                        expense,
                        BigDecimal::add
                );
            }
        }

        }
        if (transactionCount == 0) {
            return new BudgetResponse(
                    30,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    Map.of(),
                    "No transactions were found in the last 30 days. "
                            + "A personalized budget cannot be generated yet."
            );
}

        BigDecimal remainingIncome =
                totalIncome.subtract(totalExpenses);

        StringBuilder categorySummary = new StringBuilder();

        expensesByCategory.forEach((category, amount) ->
                categorySummary
                        .append("- ")
                        .append(category)
                        .append(": $")
                        .append(amount)
                        .append("\n")
        );

        String prompt = """
                You are a budgeting assistant for a banking application called BNTO.

                Your goal is to provide practical, responsible financial suggestions.

                Important rules:
                Important rules:
                    - The financial totals and category amounts below were calculated by BNTO and are authoritative.
                    - Do not change or recalculate the supplied totals.
                    - Use the actual spending categories and amounts when making recommendations.
                    - Make each recommendation specific to this user's financial data.
                    - Explain why each recommendation may help based on the user's spending patterns.
                    - You may compare categories and point out unusually large discretionary expenses.
                    - You may recommend that the user reduce a specific category, but do not invent an exact dollar savings amount unless that amount is explicitly provided in the financial summary.
                    - Do not invent expenses, income, debts, goals, or financial circumstances that are not provided.
                    - Treat housing, groceries, utilities, basic transportation, healthcare,
                    insurance, and required debt payments as essential expenses.
                    - Essential expenses may be reviewed for efficiency, but should not be described as unnecessary.
                    - Focus spending-reduction recommendations primarily on discretionary categories such as entertainment, subscriptions, dining out, and luxury purchases.
                    - The user's remaining income can be discussed as available for savings, emergency funds, or other financial goals.
                    - Do not provide investment, tax, or legal advice.
                    - Be concise, practical, supportive, and non-judgmental.

                Financial summary for the last 30 days:

                Total income: $%s
                Total expenses: $%s
                Remaining income: $%s

                Expenses by category:
                %s

                Provide exactly three personalized budgeting recommendations.

                    For each recommendation:
                    1. Refer to at least one actual category or amount from the financial summary.
                    2. Explain why the recommendation is relevant to this user's spending.
                    3. Give a concrete action the user could take.

                    Do not repeat the same advice in multiple recommendations.
                """.formatted(
                totalIncome,
                totalExpenses,
                remainingIncome,
                categorySummary
        );

        String recommendations = ollamaService.generate(prompt);

        return new BudgetResponse(
                30,
                totalIncome,
                totalExpenses,
                remainingIncome,
                Map.copyOf(expensesByCategory),
                recommendations
);
    }
}