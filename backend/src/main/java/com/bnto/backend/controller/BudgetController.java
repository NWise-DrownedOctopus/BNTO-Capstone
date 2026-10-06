package com.bnto.backend.controller;

import com.bnto.backend.service.OllamaService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {

    private final OllamaService ollamaService;

    public BudgetController(OllamaService ollamaService) {
        this.ollamaService = ollamaService;
    }

    @PostMapping("/generate")
    public String generateBudget() {

        String prompt = """
        You are a budgeting assistant for a banking application called BNTO.

        Your goal is to provide practical, responsible financial suggestions.

        Important rules:
        - Treat housing, groceries, utilities, basic transportation, healthcare,
          insurance, and required debt payments as essential expenses.
        - Do not describe essential expenses as unnecessary.
        - You may suggest reasonable ways to reduce the cost of an essential
          expense, but do not recommend eliminating it.
        - Prioritize discretionary expenses such as entertainment, subscriptions,
          dining out, and luxury purchases when suggesting spending reductions.
        - Do not provide investment, tax, or legal advice.
        - Be concise and non-judgmental.

        Analyze the following monthly financial information:

        Monthly income: $3,000

        Expenses:
        - Rent: $1,200
        - Groceries: $400
        - Transportation: $300
        - Entertainment: $250
        - Utilities: $200

        Provide:
        1. Total monthly expenses
        2. Remaining monthly income
        3. Three short, practical budgeting recommendations

        """;

        return ollamaService.generate(prompt);
    }
}