package com.pujasetu.service;

import com.pujasetu.model.Notification;
import com.pujasetu.model.enums.NotificationType;
import com.pujasetu.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final FcmService fcmService;

    public void createNotification(String userId, String title, String body, NotificationType type) {
        createNotification(userId, title, body, type, null);
    }

    public void createNotification(String userId, String title, String body, NotificationType type,
                                 Map<String, Object> data) {
        notificationRepository.save(Notification.builder()
                .userId(userId)
                .title(title)
                .body(body)
                .type(type)
                .data(data)
                .build());
        fcmService.sendToUser(userId, title, body, data);
    }

    public Map<String, Object> getMyNotifications(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().limit(50).toList();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("notifications", notifications);
        return response;
    }

    public Map<String, Object> markAsRead(String userId, List<String> ids) {
        if (ids != null && !ids.isEmpty()) {
            notificationRepository.findAllById(ids).forEach(n -> {
                if (userId.equals(n.getUserId())) {
                    n.setRead(true);
                    notificationRepository.save(n);
                }
            });
        }
        return Map.of("success", true);
    }
}
