package com.moneymanager.backend.user.dto;

import com.moneymanager.backend.user.Theme;
import com.moneymanager.backend.user.User;

import java.math.BigDecimal;

public record UserResponse(
        Long id,
        String name,
        String email,
        String currency,
        BigDecimal monthlyLimit,
        Theme theme,
        String avatar
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCurrency(),
                user.getMonthlyLimit(),
                user.getTheme(),
                user.getAvatar()
        );
    }
}
