package com.gym.notificationservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

public class InactiveUserReminderRequest extends NotificationRequest {
    @NotBlank
    private String userName;
    @Min(1)
    private int daysInactive;

    public String getUserName() {
        return userName;
    }

    public int getDaysInactive() {
        return daysInactive;
    }
}
