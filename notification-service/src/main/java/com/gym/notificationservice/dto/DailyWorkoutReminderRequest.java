package com.gym.notificationservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

public class DailyWorkoutReminderRequest extends NotificationRequest {
    @NotBlank
    private String userName;
    @NotBlank
    private String planName;
    @NotBlank
    private String workoutDay; // e.g., "Monday", "Leg Day"

    public String getUserName() {
        return userName;
    }

    public String getPlanName() {
        return planName;
    }

    public String getWorkoutDay() {
        return workoutDay;
    }
}
