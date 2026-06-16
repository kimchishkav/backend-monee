package com.moneymanager.backend.user;

import com.moneymanager.backend.security.CurrentUser;
import com.moneymanager.backend.user.dto.UpdateProfileRequest;
import com.moneymanager.backend.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    @GetMapping
    public UserResponse getProfile() {
        return UserResponse.from(currentUser.get());
    }

    @PutMapping
    public UserResponse updateProfile(@RequestBody UpdateProfileRequest request) {
        User user = currentUser.get();

        if (request.name() != null && !request.name().isBlank()) {
            user.setName(request.name());
        }
        if (request.currency() != null && !request.currency().isBlank()) {
            user.setCurrency(request.currency());
        }
        if (request.monthlyLimit() != null) {
            user.setMonthlyLimit(request.monthlyLimit());
        }
        if (request.theme() != null) {
            user.setTheme(request.theme());
        }
        if (request.removeAvatar()) {
            user.setAvatar(null);
        } else if (request.avatar() != null && !request.avatar().isBlank()) {
            user.setAvatar(request.avatar());
        }

        userRepository.save(user);
        return UserResponse.from(user);
    }
}
