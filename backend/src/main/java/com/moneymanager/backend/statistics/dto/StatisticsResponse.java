package com.moneymanager.backend.statistics.dto;

import com.moneymanager.backend.dashboard.dto.DailyAmount;
import com.moneymanager.backend.transaction.Category;

import java.math.BigDecimal;
import java.util.List;

public record StatisticsResponse(
        BigDecimal totalIncome,
        BigDecimal totalExpense,
        BigDecimal balance,
        List<CategoryAmount> categories,
        Category topCategory,
        List<DailyAmount> dailyExpenses
) {
}
