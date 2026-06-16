package com.moneymanager.backend.statistics.dto;

import com.moneymanager.backend.transaction.Category;

import java.math.BigDecimal;

public record CategoryAmount(Category category, BigDecimal amount, BigDecimal percent) {
}
