package com.gym.notificationservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

public class MembershipExpiryNotificationRequest extends NotificationRequest {
    @NotBlank
    private String userName;
    @Min(0)
    private int daysUntilExpiry;

    public String getUserName() {
        return userName;
    }

    public int getDaysUntilExpiry() {
        return daysUntilExpiry;
    }
}
