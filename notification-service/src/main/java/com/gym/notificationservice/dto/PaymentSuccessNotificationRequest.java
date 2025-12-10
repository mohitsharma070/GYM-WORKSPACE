package com.gym.notificationservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

public class PaymentSuccessNotificationRequest extends NotificationRequest {
    @NotBlank
    private String userName;
    @NotBlank
    private String amount;
    @NotBlank
    private String membershipType;

    public String getUserName() {
        return userName;
    }

    public String getAmount() {
        return amount;
    }

    public String getMembershipType() {
        return membershipType;
    }
}
