package com.notificationservice.service;

import com.notificationservice.dto.NotificationRequest;
import com.notificationservice.dto.NotificationResult;
import com.notificationservice.dto.PromotionalNotificationRequest;

import java.util.List;

public interface IWhatsAppNotificationService {
    NotificationResult sendNotification(NotificationRequest request);
    List<NotificationResult> sendPromotionalNotification(PromotionalNotificationRequest request);
}
