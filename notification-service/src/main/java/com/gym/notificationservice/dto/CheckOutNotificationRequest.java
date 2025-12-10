package com.gym.notificationservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

public class CheckOutNotificationRequest extends NotificationRequest {
    @NotBlank
    private String userName;
    @NotBlank
    private String checkOutTime; // e.g., "10:30 AM" or "2025-12-10 10:30"

    public String getUserName() {
        return userName;
    }

    public String getCheckOutTime() {
        return checkOutTime;
    }
}
