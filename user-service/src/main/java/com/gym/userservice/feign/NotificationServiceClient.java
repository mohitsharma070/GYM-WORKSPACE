package com.gym.userservice.feign;

import com.gym.userservice.dto.PromotionalNotificationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service", url = "${notification.service.url}")
public interface NotificationServiceClient {

    @PostMapping("/promotional-notifications")
    void sendNotification(@RequestBody PromotionalNotificationRequest request);
}
