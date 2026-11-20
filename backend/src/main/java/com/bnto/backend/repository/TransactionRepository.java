package com.bnto.backend.repository;

import com.bnto.backend.model.BankTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<BankTransaction, Long> {

    List<BankTransaction> findByAccountId(Long accountId);
}