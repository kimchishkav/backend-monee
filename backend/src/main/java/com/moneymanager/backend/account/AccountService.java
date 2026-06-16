package com.moneymanager.backend.account;

import com.moneymanager.backend.account.dto.AccountRequest;
import com.moneymanager.backend.account.dto.AccountResponse;
import com.moneymanager.backend.exception.ApiException;
import com.moneymanager.backend.security.CurrentUser;
import com.moneymanager.backend.transaction.TransactionRepository;
import com.moneymanager.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
                .build();
        accountRepository.save(account);
        return AccountResponse.from(account);
    }

    public AccountResponse updateAccount(Long id, AccountRequest request) {
        Account account = getOwnedAccount(id);
        account.setName(request.name());
        account.setType(request.type());
        account.setBalance(request.balance());
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

    Account getOwnedAccount(Long id) {
        return accountRepository.findByIdAndUser(id, currentUser.get())
                .orElseThrow(() -> ApiException.notFound("Счет не найден"));
    }
}
