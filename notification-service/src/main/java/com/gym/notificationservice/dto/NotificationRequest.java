package com.gym.notificationservice.dto;

import com.gym.notificationservice.entity.NotificationTemplate.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Map;

public class NotificationRequest {
    @NotBlank
    private String recipientPhoneNumber;
    @NotNull
    private NotificationType notificationType;
    private Map<String, String> templateParams; // Dynamic parameters for the template

    public String getRecipientPhoneNumber() {
        return recipientPhoneNumber;
    }

    public NotificationType getNotificationType() {
        return notificationType;
    }

    public Map<String, String> getTemplateParams() {
        return templateParams;
    }
}
