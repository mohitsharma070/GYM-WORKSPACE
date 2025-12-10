package com.gym.notificationservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

public class WorkoutPlanNotificationRequest extends NotificationRequest {
    @NotBlank
    private String memberName;
    @NotBlank
    private String trainerName;
    @NotBlank
    private String planName;

    public String getMemberName() {
        return memberName;
    }

    public String getTrainerName() {
        return trainerName;
    }

    public String getPlanName() {
        return planName;
    }
}
