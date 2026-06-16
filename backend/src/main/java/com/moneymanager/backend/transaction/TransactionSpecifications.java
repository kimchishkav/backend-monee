package com.moneymanager.backend.transaction;

import com.moneymanager.backend.user.User;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public final class TransactionSpecifications {

    private TransactionSpecifications() {
    }

    public static Specification<Transaction> search(User user, TransactionType type, Category category,
                                                      Long accountId, LocalDate from, LocalDate to) {
        return (root, query, cb) -> {
            var predicate = cb.equal(root.get("user"), user);
            predicate = cb.and(predicate,
                    type == null ? cb.conjunction() : cb.equal(root.get("type"), type));
            predicate = cb.and(predicate,
                    category == null ? cb.conjunction() : cb.equal(root.get("category"), category));
            predicate = cb.and(predicate,
                    accountId == null ? cb.conjunction() : cb.equal(root.get("account").get("id"), accountId));
            predicate = cb.and(predicate,
                    from == null ? cb.conjunction() : cb.greaterThanOrEqualTo(root.get("date"), from));
            predicate = cb.and(predicate,
                    to == null ? cb.conjunction() : cb.lessThanOrEqualTo(root.get("date"), to));
            return predicate;
        };
    }
}
