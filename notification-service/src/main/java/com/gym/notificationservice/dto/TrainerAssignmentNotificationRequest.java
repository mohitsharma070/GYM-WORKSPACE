package com.gym.notificationservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

public class TrainerAssignmentNotificationRequest extends NotificationRequest {
    @NotBlank
    private String trainerName;
    @NotBlank
    private String memberName; // Name of the member assigned or who completed a plan
    private String planName; // Optional, for workout plan completion notifications

    public String getTrainerName() {
        return trainerName;
    }

    public String getMemberName() {
        return memberName;
    }

    public String getPlanName() {
        return planName;
    }
}
