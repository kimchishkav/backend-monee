package com.moneymanager.backend.dashboard;

import com.moneymanager.backend.account.Account;
import com.moneymanager.backend.account.AccountRepository;
import com.moneymanager.backend.account.AccountType;
import com.moneymanager.backend.account.dto.AccountResponse;
import com.moneymanager.backend.dashboard.dto.DailyAmount;
import com.moneymanager.backend.dashboard.dto.DashboardResponse;
import com.moneymanager.backend.security.CurrentUser;
import com.moneymanager.backend.transaction.Transaction;
import com.moneymanager.backend.transaction.TransactionRepository;
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
public class DashboardService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final CurrentUser currentUser;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(YearMonth month) {
        User user = currentUser.get();
        List<Account> accounts = accountRepository.findByUser(user);

        BigDecimal accountsBalance = sumBalance(accounts, t -> t != AccountType.DEPOSIT);
        BigDecimal depositsBalance = sumBalance(accounts, t -> t == AccountType.DEPOSIT);
        BigDecimal totalBalance = accountsBalance.add(depositsBalance);

        long accountsCount = accounts.stream().filter(a -> a.getType() != AccountType.DEPOSIT).count();
        long depositsCount = accounts.stream().filter(a -> a.getType() == AccountType.DEPOSIT).count();

        LocalDate from = month.atDay(1);
        LocalDate to = month.atEndOfMonth();
        List<Transaction> monthExpenses = transactionRepository
                .findByUserAndTypeAndDateBetween(user, TransactionType.EXPENSE, from, to);
        BigDecimal monthlyExpenses = sumAmount(monthExpenses);

        YearMonth prevMonth = month.minusMonths(1);
        List<Transaction> prevMonthExpenses = transactionRepository
                .findByUserAndTypeAndDateBetween(user, TransactionType.EXPENSE, prevMonth.atDay(1), prevMonth.atEndOfMonth());
        BigDecimal prevMonthlyExpenses = sumAmount(prevMonthExpenses);
        BigDecimal expensesChangePercent = percentChange(prevMonthlyExpenses, monthlyExpenses);

        List<com.moneymanager.backend.transaction.dto.TransactionResponse> recentTransactions =
                transactionRepository.findTop5ByUserOrderByDateDescCreatedAtDesc(user)
                        .stream().map(com.moneymanager.backend.transaction.dto.TransactionResponse::from).toList();

        List<DailyAmount> expensesChart = buildDailyChart(monthExpenses, from, to);

        List<AccountResponse> accountResponses = accounts.stream()
                .sorted(Comparator.comparing(Account::getCreatedAt))
                .map(AccountResponse::from)
                .toList();

        BigDecimal monthlyLimit = user.getMonthlyLimit();
        boolean limitExceeded = monthlyLimit != null && monthlyExpenses.compareTo(monthlyLimit) > 0;

        return new DashboardResponse(
                totalBalance,
                null,
                accountsBalance,
                (int) accountsCount,
                depositsBalance,
                (int) depositsCount,
                monthlyExpenses,
                expensesChangePercent,
                recentTransactions,
                expensesChart,
                accountResponses,
                limitExceeded
        );
    }

    private BigDecimal sumBalance(List<Account> accounts, java.util.function.Predicate<AccountType> filter) {
        return accounts.stream()
                .filter(a -> filter.test(a.getType()))
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal sumAmount(List<Transaction> transactions) {
        return transactions.stream().map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal percentChange(BigDecimal previous, BigDecimal current) {
        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(1, RoundingMode.HALF_UP);
    }

    private List<DailyAmount> buildDailyChart(List<Transaction> transactions, LocalDate from, LocalDate to) {
        Map<LocalDate, BigDecimal> byDay = transactions.stream()
                .collect(Collectors.groupingBy(Transaction::getDate, TreeMap::new,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)));

        List<DailyAmount> result = new java.util.ArrayList<>();
        for (LocalDate day = from; !day.isAfter(to); day = day.plusDays(1)) {
            result.add(new DailyAmount(day, byDay.getOrDefault(day, BigDecimal.ZERO)));
        }
        return result;
    }
}
