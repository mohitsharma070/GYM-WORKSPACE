package com.gym.notificationservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

public class CheckInNotificationRequest extends NotificationRequest {
    @NotBlank
    private String userName;
    @NotBlank
    private String checkInTime; // e.g., "10:30 AM" or "2025-12-10 10:30"

    public String getUserName() {
        return userName;
    }

    public String getCheckInTime() {
        return checkInTime;
    }
}
