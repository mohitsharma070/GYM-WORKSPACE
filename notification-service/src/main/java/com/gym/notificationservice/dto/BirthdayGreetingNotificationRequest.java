package com.gym.notificationservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

public class BirthdayGreetingNotificationRequest extends NotificationRequest {
    @NotBlank
    private String userName;

    public String getUserName() {
        return userName;
    }
}
