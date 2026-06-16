package com.moneymanager.backend.transaction;

import com.moneymanager.backend.account.Account;
import com.moneymanager.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

    boolean existsByAccount(Account account);

    Optional<Transaction> findByIdAndUser(Long id, User user);

    List<Transaction> findTop5ByUserOrderByDateDescCreatedAtDesc(User user);

    List<Transaction> findByUserAndTypeAndDateBetween(User user, TransactionType type, LocalDate from, LocalDate to);

    List<Transaction> findByUserAndTypeAndAccountIdAndDateBetween(
            User user, TransactionType type, Long accountId, LocalDate from, LocalDate to);
}
