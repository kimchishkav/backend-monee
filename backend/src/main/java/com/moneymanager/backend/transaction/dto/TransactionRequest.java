package com.moneymanager.backend.transaction.dto;

import com.moneymanager.backend.transaction.Category;
import com.moneymanager.backend.transaction.TransactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionRequest(
        @NotNull(message = "Тип операции обязателен") TransactionType type,
        @NotNull(message = "Сумма обязательна") @Positive(message = "Сумма должна быть положительной") BigDecimal amount,
        Category category,           // null для TRANSFER
        @NotNull(message = "Счет обязателен") Long accountId,
        Long toAccountId,            // только для TRANSFER
        @NotNull(message = "Дата обязательна") LocalDate date,
        String description
) {
}
