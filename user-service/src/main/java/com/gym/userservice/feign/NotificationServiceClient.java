package com.gym.userservice.feign;

import com.gym.userservice.dto.NotificationRequest; // This DTO will be created next
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service", url = "${notification.service.url}")
public interface NotificationServiceClient {

    @PostMapping("/api/notifications")
    ResponseEntity<String> sendNotification(@RequestBody NotificationRequest request);
}
