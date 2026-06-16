package com.moneymanager.backend.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Имя обязательно") String name,
        @NotBlank(message = "Email обязателен") @Email(message = "Некорректный email") String email,
        @NotBlank(message = "Пароль обязателен") @Size(min = 6, message = "Пароль должен быть не короче 6 символов") String password
) {
}
