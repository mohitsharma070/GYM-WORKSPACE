package com.gym.notificationservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

public class PromotionalNotificationRequest extends NotificationRequest {
    @NotBlank
    private String messageBody;

    public String getMessageBody() {
        return messageBody;
    }
}
