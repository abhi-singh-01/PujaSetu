package com.pujasetu.controller;

import com.pujasetu.security.SecurityUtils;
import com.pujasetu.service.NotificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getMyNotifications() {
        String userId = securityUtils.requireCurrentUser().getUser().getId();
        return ResponseEntity.ok(notificationService.getMyNotifications(userId));
    }

    @PostMapping("/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@RequestBody Map<String, List<String>> body) {
        String userId = securityUtils.requireCurrentUser().getUser().getId();
        return ResponseEntity.ok(notificationService.markAsRead(userId, body.get("ids")));
    }
}
