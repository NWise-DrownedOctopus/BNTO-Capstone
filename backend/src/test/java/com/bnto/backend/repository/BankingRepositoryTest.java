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
}