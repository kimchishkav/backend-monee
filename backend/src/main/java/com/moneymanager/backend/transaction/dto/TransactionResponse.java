package com.moneymanager.backend.transaction.dto;

import com.moneymanager.backend.transaction.Category;
import com.moneymanager.backend.transaction.Transaction;
import com.moneymanager.backend.transaction.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionResponse(
        Long id,
        TransactionType type,
        BigDecimal amount,
        Category category,
        Long accountId,
        String accountName,
        Long toAccountId,
        String toAccountName,
        LocalDate date,
        String description
) {
    public static TransactionResponse from(Transaction t) {
        return new TransactionResponse(
                t.getId(),
                t.getType(),
                t.getAmount(),
                t.getCategory(),
                t.getAccount().getId(),
                t.getAccount().getName(),
                t.getToAccount() != null ? t.getToAccount().getId() : null,
                t.getToAccount() != null ? t.getToAccount().getName() : null,
                t.getDate(),
                t.getDescription()
        );
    }
}
