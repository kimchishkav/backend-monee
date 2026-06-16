package com.moneymanager.backend.statistics;

import com.moneymanager.backend.dashboard.dto.DailyAmount;
import com.moneymanager.backend.security.CurrentUser;
import com.moneymanager.backend.statistics.dto.CategoryAmount;
import com.moneymanager.backend.statistics.dto.StatisticsResponse;
import com.moneymanager.backend.transaction.Transaction;
import com.moneymanager.backend.transaction.TransactionRepository;
import com.moneymanager.backend.transaction.TransactionSpecifications;
import com.moneymanager.backend.transaction.TransactionType;
import com.moneymanager.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final TransactionRepository transactionRepository;
    private final CurrentUser currentUser;

    @Transactional(readOnly = true)
    public StatisticsResponse getStatistics(YearMonth month, Long accountId) {
        User user = currentUser.get();
        LocalDate from = month.atDay(1);
        LocalDate to = month.atEndOfMonth();

        List<Transaction> expenses = transactionRepository.findAll(
                TransactionSpecifications.search(user, TransactionType.EXPENSE, null, accountId, from, to));
        List<Transaction> incomes = transactionRepository.findAll(
                TransactionSpecifications.search(user, TransactionType.INCOME, null, accountId, from, to));

        BigDecimal totalExpense = sum(expenses);
        BigDecimal totalIncome = sum(incomes);
        BigDecimal balance = totalIncome.subtract(totalExpense);

        Map<com.moneymanager.backend.transaction.Category, BigDecimal> byCategory = expenses.stream()
                .collect(Collectors.groupingBy(Transaction::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)));

        List<CategoryAmount> categories = byCategory.entrySet().stream()
                .map(e -> new CategoryAmount(e.getKey(), e.getValue(), percentOf(e.getValue(), totalExpense)))
                .sorted(Comparator.comparing(CategoryAmount::amount).reversed())
                .toList();

        var topCategory = categories.isEmpty() ? null : categories.get(0).category();

        Map<LocalDate, BigDecimal> byDay = expenses.stream()
                .collect(Collectors.groupingBy(Transaction::getDate, TreeMap::new,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)));

        List<DailyAmount> dailyExpenses = new java.util.ArrayList<>();
        for (LocalDate day = from; !day.isAfter(to); day = day.plusDays(1)) {
            dailyExpenses.add(new DailyAmount(day, byDay.getOrDefault(day, BigDecimal.ZERO)));
        }

        return new StatisticsResponse(totalIncome, totalExpense, balance, categories, topCategory, dailyExpenses);
    }

    private BigDecimal sum(List<Transaction> transactions) {
        return transactions.stream().map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal percentOf(BigDecimal part, BigDecimal total) {
        if (total.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return part.divide(total, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(1, RoundingMode.HALF_UP);
    }
}
