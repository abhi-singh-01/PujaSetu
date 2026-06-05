package com.pujasetu.controller;

import com.pujasetu.model.Provider;
import com.pujasetu.model.User;
import com.pujasetu.security.SecurityUtils;
import com.pujasetu.service.ProviderService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/providers")
@RequiredArgsConstructor
@Tag(name = "Providers")
public class ProviderController {

    private final ProviderService providerService;
    private final SecurityUtils securityUtils;

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(@RequestParam Map<String, String> params) {
        return ResponseEntity.ok(providerService.searchProviders(params));
    }

    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> listPending() {
        return ResponseEntity.ok(providerService.listPendingProviders());
    }

    @PutMapping("/admin/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> verifyProvider(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {
        User admin = securityUtils.requireCurrentUser().getUser();
        return ResponseEntity.ok(providerService.approveProvider(
                id, body.get("status"), body.get("rejectionReason"), admin.getId()));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Provider provider) {
        User user = securityUtils.requireCurrentUser().getUser();
        return ResponseEntity.status(201).body(providerService.registerProvider(user, provider));
    }

    @GetMapping("/profile/me")
    public ResponseEntity<Map<String, Object>> getMyProfile() {
        User user = securityUtils.requireCurrentUser().getUser();
        return ResponseEntity.ok(providerService.getMyProfile(user.getId()));
    }

    @PutMapping("/profile/me")
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody Provider provider) {
        User user = securityUtils.requireCurrentUser().getUser();
        return ResponseEntity.ok(providerService.updateProvider(user.getId(), provider));
    }

    @GetMapping("/profile/me/pricing")
    public ResponseEntity<Map<String, Object>> getPricing() {
        User user = securityUtils.requireCurrentUser().getUser();
        return ResponseEntity.ok(providerService.getPricing(user.getId()));
    }

    @PutMapping("/profile/me/pricing")
    public ResponseEntity<Map<String, Object>> updatePricing(@RequestBody Provider provider) {
        User user = securityUtils.requireCurrentUser().getUser();
        return ResponseEntity.ok(providerService.updatePricing(user.getId(), provider));
    }

    @PutMapping("/availability")
    public ResponseEntity<Map<String, Object>> updateAvailability(
            @RequestBody Map<String, List<Provider.AvailabilitySlot>> body
    ) {
        User user = securityUtils.requireCurrentUser().getUser();
        return ResponseEntity.ok(providerService.updateAvailability(user.getId(), body.get("availability")));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable String id) {
        return ResponseEntity.ok(providerService.getProviderById(id));
    }
}
