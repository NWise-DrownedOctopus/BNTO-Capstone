package com.bnto.backend.controller;

import com.bnto.backend.service.BudgetService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping("/generate")
    public String generateBudget(@RequestParam Long userId) {
        return budgetService.generateBudget(userId);
    }
}