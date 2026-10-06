package com.bnto.backend.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    public String generateBudget(Long userId) {

        List<Account> accounts = accountRepository.findByUserId(userId);

        if (accounts.isEmpty()) {
            return "No accounts were found for this user.";
        }

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;

        Map<String, BigDecimal> expensesByCategory = new HashMap<>();

        for (Account account : accounts) {

            List<BankTransaction> transactions =
                    transactionRepository.findByAccountId(account.getId());

            for (BankTransaction transaction : transactions) {

                BigDecimal amount = transaction.getAmount();

                if (amount.compareTo(BigDecimal.ZERO) > 0) {

                    totalIncome = totalIncome.add(amount);

                } else if (amount.compareTo(BigDecimal.ZERO) < 0) {

                    BigDecimal expense = amount.abs();

                    totalExpenses = totalExpenses.add(expense);

                    String category = transaction.getCategory();

                    expensesByCategory.merge(
                            category,
                            expense,
                            BigDecimal::add
                    );
                }
            }
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

                Financial summary:

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

        return ollamaService.generate(prompt);
    }
}