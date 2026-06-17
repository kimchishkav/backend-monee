package com.moneymanager.backend.account;

import com.moneymanager.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUser(User user);
    List<Account> findByUserAndType(User user, AccountType type);
    List<Account> findByUserAndStatus(User user, AccountStatus status);
    Optional<Account> findByIdAndUser(Long id, User user);
}
