package com.gym.workoutservice.client;

import com.gym.workoutservice.dto.NotificationRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class NotificationClient {
    @Value("${notification.service.url:http://localhost:8083}")
    private String notificationServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendNotification(NotificationRequest request) {
        String url = notificationServiceUrl + "/api/notifications/send";
        restTemplate.postForEntity(url, request, String.class);
    }
}