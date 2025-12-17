package com.notificationservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationResult {
    private boolean success;
    private String message;
    private String externalMessageId;

    public static NotificationResult success(String externalMessageId) {
        return NotificationResult.builder()
                .success(true)
                .message("Notification sent successfully.")
                .externalMessageId(externalMessageId)
                .build();
    }

    public static NotificationResult failure(String message) {
        return NotificationResult.builder()
                .success(false)
                .message(message)
                .build();
    }
}
