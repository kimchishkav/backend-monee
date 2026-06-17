package com.moneymanager.backend.dashboard.dto;

import com.moneymanager.backend.account.dto.AccountResponse;
import com.moneymanager.backend.transaction.dto.TransactionResponse;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        BigDecimal totalBalance,
        BigDecimal balanceChangePercent,
        BigDecimal accountsBalance,
        int accountsCount,
        BigDecimal depositsBalance,
        int depositsCount,
        BigDecimal frozenBalance,
        int frozenCount,
        BigDecimal monthlyExpenses,
        BigDecimal expensesChangePercent,
        List<TransactionResponse> recentTransactions,
        List<DailyAmount> expensesChart,
        List<AccountResponse> accounts,
        boolean limitExceeded
) {
}
