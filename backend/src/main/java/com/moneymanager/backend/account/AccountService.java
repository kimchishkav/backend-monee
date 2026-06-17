package com.moneymanager.backend.account;

import com.moneymanager.backend.account.dto.AccountRequest;
import com.moneymanager.backend.account.dto.AccountResponse;
import com.moneymanager.backend.exception.ApiException;
import com.moneymanager.backend.security.CurrentUser;
import com.moneymanager.backend.transaction.Transaction;
import com.moneymanager.backend.transaction.TransactionRepository;
import com.moneymanager.backend.transaction.TransactionType;
import com.moneymanager.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final CurrentUser currentUser;

    public List<AccountResponse> getAccounts(AccountType type) {
        User user = currentUser.get();
        List<Account> accounts = type == null
                ? accountRepository.findByUser(user)
                : accountRepository.findByUserAndType(user, type);
        return accounts.stream().map(AccountResponse::from).toList();
    }

    public AccountResponse createAccount(AccountRequest request) {
        Account account = Account.builder()
                .user(currentUser.get())
                .name(request.name())
                .type(request.type())
                .balance(request.balance())
                .status(request.status() != null ? request.status() : AccountStatus.ACTIVE)
                .notes(request.notes())
                .build();
        accountRepository.save(account);
        return AccountResponse.from(account);
    }

    public AccountResponse updateAccount(Long id, AccountRequest request) {
        Account account = getOwnedAccount(id);
        account.setName(request.name());
        account.setType(request.type());
        account.setBalance(request.balance());
        if (request.status() != null) account.setStatus(request.status());
        account.setNotes(request.notes());
        accountRepository.save(account);
        return AccountResponse.from(account);
    }

    public void deleteAccount(Long id) {
        Account account = getOwnedAccount(id);
        if (transactionRepository.existsByAccount(account)) {
            throw ApiException.conflict("Невозможно удалить счет, у которого есть операции");
        }
        accountRepository.delete(account);
    }

    /** Разморозить: перевести баланс на целевой счёт, счёт становится ACTIVE с нулевым балансом */
    @Transactional
    public AccountResponse unfreezeAccount(Long frozenId, Long toAccountId) {
        User user = currentUser.get();
        Account frozen = getOwnedAccount(frozenId);
        if (frozen.getStatus() != AccountStatus.FROZEN) {
            throw ApiException.badRequest("Счет не заморожен");
        }
        Account target = accountRepository.findByIdAndUser(toAccountId, user)
                .orElseThrow(() -> ApiException.notFound("Целевой счет не найден"));
        if (frozen.getBalance().compareTo(BigDecimal.ZERO) > 0) {
            target.setBalance(target.getBalance().add(frozen.getBalance()));
            accountRepository.save(target);

            // Запись перевода
            Transaction transfer = Transaction.builder()
                    .user(user)
                    .account(frozen)
                    .toAccount(target)
                    .type(TransactionType.TRANSFER)
                    .amount(frozen.getBalance())
                    .date(LocalDate.now())
                    .description("Разморозка: " + frozen.getName() + " → " + target.getName())
                    .build();
            transactionRepository.save(transfer);
        }
        frozen.setBalance(BigDecimal.ZERO);
        frozen.setStatus(AccountStatus.ACTIVE);
        accountRepository.save(frozen);
        return AccountResponse.from(frozen);
    }

    Account getOwnedAccount(Long id) {
        return accountRepository.findByIdAndUser(id, currentUser.get())
                .orElseThrow(() -> ApiException.notFound("Счет не найден"));
    }
}
