package com.moneymanager.backend.account.dto;

import com.moneymanager.backend.account.Account;
import com.moneymanager.backend.account.AccountType;

import java.math.BigDecimal;

public record AccountResponse(
        Long id,
        String name,
        AccountType type,
        BigDecimal balance
) {
    public static AccountResponse from(Account account) {
        return new AccountResponse(account.getId(), account.getName(), account.getType(), account.getBalance());
    }
}
