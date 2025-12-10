package com.gym.notificationservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

public class MonthlyAttendanceSummaryRequest extends NotificationRequest {
    @NotBlank
    private String userName;
    @Min(0)
    private int totalCheckIns;
    @NotBlank
    private String monthYear; // e.g., "December 2025"

    public String getUserName() {
        return userName;
    }

    public int getTotalCheckIns() {
        return totalCheckIns;
    }

    public String getMonthYear() {
        return monthYear;
    }
}
