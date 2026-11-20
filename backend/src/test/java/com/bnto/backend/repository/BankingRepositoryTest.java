package com.bnto.backend.repository;

import com.bnto.backend.model.Account;
import com.bnto.backend.model.BankTransaction;
import com.bnto.backend.model.User;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class BankingRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Test
    void userAccountAndTransactionRelationshipsWork() {

        // Create user
        User user = new User(
                "banking-test@bnto.com",
                "hashedPassword"
        );

        userRepository.save(user);

        assertNotNull(user.getId());

        // Create account belonging to user
        Account account = new Account(
                "Primary Checking",
                "CHECKING",
                new BigDecimal("1500.00"),
                user
        );

        accountRepository.save(account);

        assertNotNull(account.getId());

        // Create transaction belonging to account
        BankTransaction transaction = new BankTransaction(
                "Grocery Store",
                new BigDecimal("-75.25"),
                LocalDateTime.now(),
                "Groceries",
                account
        );

        transactionRepository.save(transaction);

        assertNotNull(transaction.getId());

        // Retrieve user's accounts
        List<Account> accounts =
                accountRepository.findByUserId(user.getId());

        assertEquals(1, accounts.size());
        assertEquals("Primary Checking", accounts.get(0).getName());
        assertEquals(
                new BigDecimal("1500.00"),
                accounts.get(0).getBalance()
        );

        // Retrieve account's transactions
        List<BankTransaction> transactions =
                transactionRepository.findByAccountId(account.getId());

        assertEquals(1, transactions.size());
        assertEquals(
                "Grocery Store",
                transactions.get(0).getDescription()
        );
        assertEquals(
                new BigDecimal("-75.25"),
                transactions.get(0).getAmount()
        );
        assertEquals(
                "Groceries",
                transactions.get(0).getCategory()
        );
    }
        @Test
        void transactionsAreFilteredToLast30Days() {

        // Arrange: create a test user
        User user = new User(
                "date-filter-test@bnto.com",
                "hashedPassword"
        );

        userRepository.save(user);

        // Create an account belonging to the user
        Account account = new Account(
                "Date Filter Checking",
                "CHECKING",
                new BigDecimal("3000.00"),
                user
        );

        accountRepository.save(account);

        LocalDateTime now = LocalDateTime.now();

        // Transactions within the last 30 days
        BankTransaction paycheck = new BankTransaction(
                "Paycheck",
                new BigDecimal("3000.00"),
                now.minusDays(5),
                "Income",
                account
        );

        BankTransaction groceries = new BankTransaction(
                "Groceries",
                new BigDecimal("-150.00"),
                now.minusDays(15),
                "Groceries",
                account
        );

        BankTransaction restaurant = new BankTransaction(
                "Restaurant",
                new BigDecimal("-50.00"),
                now.minusDays(29),
                "Dining",
                account
        );

        // Transactions outside the reporting period
        BankTransaction oldPurchase = new BankTransaction(
                "Old Purchase",
                new BigDecimal("-100.00"),
                now.minusDays(45),
                "Shopping",
                account
        );

        BankTransaction futurePurchase = new BankTransaction(
                "Future Purchase",
                new BigDecimal("-75.00"),
                now.plusDays(5),
                "Shopping",
                account
        );

        transactionRepository.saveAll(List.of(
                paycheck,
                groceries,
                restaurant,
                oldPurchase,
                futurePurchase
        ));

        // Act: query only transactions within the last 30 days
        List<BankTransaction> recentTransactions =
                transactionRepository
                        .findByAccountIdAndTransactionDateBetween(
                                account.getId(),
                                now.minusDays(30),
                                now
                        );

        // Assert: exactly three transactions should be returned
        assertEquals(3, recentTransactions.size());

        List<String> descriptions = recentTransactions.stream()
                .map(BankTransaction::getDescription)
                .toList();

        assertTrue(descriptions.contains("Paycheck"));
        assertTrue(descriptions.contains("Groceries"));
        assertTrue(descriptions.contains("Restaurant"));

        assertFalse(descriptions.contains("Old Purchase"));
        assertFalse(descriptions.contains("Future Purchase"));
        }
}