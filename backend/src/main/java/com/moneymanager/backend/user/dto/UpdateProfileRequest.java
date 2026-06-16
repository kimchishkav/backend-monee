package com.moneymanager.backend.user.dto;

import com.moneymanager.backend.user.Theme;

import java.math.BigDecimal;

public record UpdateProfileRequest(
        String name,
        String currency,
        BigDecimal monthlyLimit,
        Theme theme,
        String avatar,
        boolean removeAvatar
) {
}
