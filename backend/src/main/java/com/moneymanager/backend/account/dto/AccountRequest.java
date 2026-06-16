package com.moneymanager.backend.account.dto;

import com.moneymanager.backend.account.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record AccountRequest(
        @NotBlank(message = "Название счета обязательно") String name,
        @NotNull(message = "Тип счета обязателен") AccountType type,
        @NotNull(message = "Начальный баланс обязателен") BigDecimal balance
) {
}
