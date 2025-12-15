package com.notificationservice.service;

import com.notificationservice.model.NotificationRequest;

public interface IWhatsAppNotificationService {
    boolean sendNotification(NotificationRequest request);
}
