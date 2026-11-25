package com.bnto.backend.service;

import com.bnto.backend.model.Account;
import com.bnto.backend.model.BankTransaction;
import java.time.LocalDateTime;

import com.bnto.backend.dto.BudgetResponse;
import com.bnto.backend.repository.AccountRepository;
import com.bnto.backend.repository.TransactionRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class BudgetServiceTest {

    private AccountRepository accountRepository;
    private TransactionRepository transactionRepository;
    private OllamaService ollamaService;
    private BudgetService budgetService;

    @BeforeEach
    void setUp() {
        accountRepository = mock(AccountRepository.class);
        transactionRepository = mock(TransactionRepository.class);
        ollamaService = mock(OllamaService.class);

        budgetService = new BudgetService(
                accountRepository,
                transactionRepository,
                ollamaService
        );
    }

    @Test
    void generateBudgetReturnsEmptyResponseWhenNoAccountsExist() {

        // Arrange
        Long userId = 22L;

        when(accountRepository.findByUserId(userId))
                .thenReturn(List.of());

        // Act
        BudgetResponse result = budgetService.generateBudget(userId);

        // Assert
        assertEquals(30, result.periodDays());
        assertEquals(BigDecimal.ZERO, result.totalIncome());
        assertEquals(BigDecimal.ZERO, result.totalExpenses());
        assertEquals(BigDecimal.ZERO, result.remainingIncome());

        assertTrue(result.expensesByCategory().isEmpty());

        assertEquals(
                "No accounts were found for this user.",
                result.recommendations()
        );

        verify(accountRepository).findByUserId(userId);

        // Ollama should not run without financial data
        verifyNoInteractions(transactionRepository, ollamaService);
    }

    @Test
    void generateBudgetCalculatesIncomeAndExpensesCorrectly() {

        // Arrange
        Long userId = 22L;
        Long accountId = 1L;

        Account account = mock(Account.class);
        when(account.getId()).thenReturn(accountId);

        when(accountRepository.findByUserId(userId))
                .thenReturn(List.of(account));

        LocalDateTime now = LocalDateTime.now();

        BankTransaction paycheck = mock(BankTransaction.class);
        when(paycheck.getAmount())
                .thenReturn(new BigDecimal("3000.00"));

        BankTransaction groceries = mock(BankTransaction.class);
        when(groceries.getAmount())
                .thenReturn(new BigDecimal("-250.00"));
        when(groceries.getCategory()).thenReturn("Groceries");

        BankTransaction dining = mock(BankTransaction.class);
        when(dining.getAmount())
                .thenReturn(new BigDecimal("-75.00"));
        when(dining.getCategory()).thenReturn("Dining");

        BankTransaction utilities = mock(BankTransaction.class);
        when(utilities.getAmount())
                .thenReturn(new BigDecimal("-125.00"));
        when(utilities.getCategory()).thenReturn("Utilities");

        when(transactionRepository
                .findByAccountIdAndTransactionDateBetween(
                        eq(accountId),
                        any(LocalDateTime.class),
                        any(LocalDateTime.class)
                ))
                .thenReturn(List.of(
                        paycheck,
                        groceries,
                        dining,
                        utilities
                ));

        when(ollamaService.generate(anyString()))
                .thenReturn("Sample budgeting recommendations.");

        // Act
        BudgetResponse result = budgetService.generateBudget(userId);

        // Assert
        assertEquals(
                0,
                new BigDecimal("3000.00")
                        .compareTo(result.totalIncome())
        );

        assertEquals(
                0,
                new BigDecimal("450.00")
                        .compareTo(result.totalExpenses())
        );

        assertEquals(
                0,
                new BigDecimal("2550.00")
                        .compareTo(result.remainingIncome())
        );

        assertEquals(
                new BigDecimal("250.00"),
                result.expensesByCategory().get("Groceries")
        );

        assertEquals(
                new BigDecimal("75.00"),
                result.expensesByCategory().get("Dining")
        );

        assertEquals(
                new BigDecimal("125.00"),
                result.expensesByCategory().get("Utilities")
        );

        assertEquals(
                "Sample budgeting recommendations.",
                result.recommendations()
        );

        verify(ollamaService).generate(anyString());
    }

    @Test
    void generateBudgetExcludesInternalTransfers() {

        Long userId = 22L;
        Long accountId = 1L;

        Account account = mock(Account.class);
        when(account.getId()).thenReturn(accountId);

        when(accountRepository.findByUserId(userId))
                .thenReturn(List.of(account));

        BankTransaction paycheck = mock(BankTransaction.class);
        when(paycheck.getAmount())
                .thenReturn(new BigDecimal("2000.00"));

        BankTransaction transferOut = mock(BankTransaction.class);
        when(transferOut.getCategory())
                .thenReturn("Internal Transfer");

        BankTransaction transferIn = mock(BankTransaction.class);
        when(transferIn.getCategory())
                .thenReturn("internal transfer");

        BankTransaction groceries = mock(BankTransaction.class);
        when(groceries.getAmount())
                .thenReturn(new BigDecimal("-200.00"));
        when(groceries.getCategory())
                .thenReturn("Groceries");

        when(transactionRepository
                .findByAccountIdAndTransactionDateBetween(
                        eq(accountId),
                        any(LocalDateTime.class),
                        any(LocalDateTime.class)
                ))
                .thenReturn(List.of(
                        paycheck,
                        transferOut,
                        transferIn,
                        groceries
                ));

        when(ollamaService.generate(anyString()))
                .thenReturn("Sample recommendations.");

        BudgetResponse result = budgetService.generateBudget(userId);

        assertEquals(
                0,
                new BigDecimal("2000.00")
                        .compareTo(result.totalIncome())
        );

        assertEquals(
                0,
                new BigDecimal("200.00")
                        .compareTo(result.totalExpenses())
        );

        assertEquals(
                0,
                new BigDecimal("1800.00")
                        .compareTo(result.remainingIncome())
        );

        assertFalse(
                result.expensesByCategory()
                        .containsKey("Internal Transfer")
        );

        verify(ollamaService).generate(anyString());
    }

    @Test
    void generateBudgetHandlesNoRecentTransactions() {

        Long userId = 22L;
        Long accountId = 1L;

        Account account = mock(Account.class);
        when(account.getId()).thenReturn(accountId);

        when(accountRepository.findByUserId(userId))
                .thenReturn(List.of(account));

        when(transactionRepository
                .findByAccountIdAndTransactionDateBetween(
                        eq(accountId),
                        any(LocalDateTime.class),
                        any(LocalDateTime.class)
                ))
                .thenReturn(List.of());

        BudgetResponse result = budgetService.generateBudget(userId);

        assertEquals(30, result.periodDays());
        assertEquals(BigDecimal.ZERO, result.totalIncome());
        assertEquals(BigDecimal.ZERO, result.totalExpenses());
        assertEquals(BigDecimal.ZERO, result.remainingIncome());

        assertTrue(result.expensesByCategory().isEmpty());

        assertEquals(
                "No transactions were found in the last 30 days. "
                        + "A personalized budget cannot be generated yet.",
                result.recommendations()
        );

        verifyNoInteractions(ollamaService);
    }


}
