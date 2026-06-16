package com.moneymanager.backend.transaction;

import com.moneymanager.backend.account.Account;
import com.moneymanager.backend.account.AccountRepository;
import com.moneymanager.backend.exception.ApiException;
import com.moneymanager.backend.security.CurrentUser;
import com.moneymanager.backend.transaction.dto.TransactionRequest;
import com.moneymanager.backend.transaction.dto.TransactionResponse;
import com.moneymanager.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CurrentUser currentUser;

    @Transactional(readOnly = true)
    public List<TransactionResponse> search(TransactionType type, Category category, Long accountId,
                                              LocalDate from, LocalDate to) {
        var spec = TransactionSpecifications.search(currentUser.get(), type, category, accountId, from, to);
        var sort = org.springframework.data.domain.Sort.by("date", "createdAt").descending();
        return transactionRepository.findAll(spec, sort)
                .stream().map(TransactionResponse::from).toList();
    }

    @Transactional
    public TransactionResponse create(TransactionRequest request) {
        User user = currentUser.get();
        Account account = accountRepository.findByIdAndUser(request.accountId(), user)
                .orElseThrow(() -> ApiException.notFound("Счет не найден"));

        if (request.type() == TransactionType.EXPENSE) {
            account.setBalance(account.getBalance().subtract(request.amount()));
        } else {
            account.setBalance(account.getBalance().add(request.amount()));
        }
        accountRepository.save(account);

        Transaction transaction = Transaction.builder()
                .user(user)
                .account(account)
                .type(request.type())
                .category(request.category())
                .amount(request.amount())
                .date(request.date())
                .description(request.description())
                .build();
        transactionRepository.save(transaction);

        return TransactionResponse.from(transaction);
    }

    @Transactional
    public void delete(Long id) {
        User user = currentUser.get();
        Transaction transaction = transactionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> ApiException.notFound("Операция не найдена"));

        Account account = transaction.getAccount();
        if (transaction.getType() == TransactionType.EXPENSE) {
            account.setBalance(account.getBalance().add(transaction.getAmount()));
        } else {
            account.setBalance(account.getBalance().subtract(transaction.getAmount()));
        }
        accountRepository.save(account);

        transactionRepository.delete(transaction);
    }
}
