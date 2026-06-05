package com.pujasetu.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
public class FcmService {

    public void sendToUser(String userId, String title, String body, Map<String, Object> data) {
        log.debug("FCM stub: user={}, title={}", userId, title);
    }
}
