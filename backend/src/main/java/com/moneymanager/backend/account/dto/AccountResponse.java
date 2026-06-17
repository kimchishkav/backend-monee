package com.moneymanager.backend.account.dto;

import com.moneymanager.backend.account.Account;
import com.moneymanager.backend.account.AccountStatus;
import com.moneymanager.backend.account.AccountType;

import java.math.BigDecimal;

public record AccountResponse(
        Long id,
        String name,
        AccountType type,
        BigDecimal balance,
        AccountStatus status,
        String notes
) {
    public static AccountResponse from(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getName(),
                account.getType(),
                account.getBalance(),
                account.getStatus(),
                account.getNotes()
        );
    }
}
