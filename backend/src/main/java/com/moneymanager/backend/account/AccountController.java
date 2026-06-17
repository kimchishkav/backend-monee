package com.moneymanager.backend.account;

import com.moneymanager.backend.account.dto.AccountRequest;
import com.moneymanager.backend.account.dto.AccountResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    public List<AccountResponse> getAccounts(@RequestParam(required = false) AccountType type) {
        return accountService.getAccounts(type);
    }

    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(@Valid @RequestBody AccountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.createAccount(request));
    }

    @PutMapping("/{id}")
    public AccountResponse updateAccount(@PathVariable Long id, @Valid @RequestBody AccountRequest request) {
        return accountService.updateAccount(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        accountService.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/unfreeze")
    public AccountResponse unfreezeAccount(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        Long toAccountId = body.get("toAccountId");
        if (toAccountId == null) throw com.moneymanager.backend.exception.ApiException.badRequest("toAccountId обязателен");
        return accountService.unfreezeAccount(id, toAccountId);
    }
}
