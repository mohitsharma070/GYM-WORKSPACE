package com.gym.workoutservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.Set;

public record WorkoutDayRequest(
    @NotNull(message = "Plan ID cannot be null")
    Long planId, // The parent plan
    
    @NotNull(message = "Day number cannot be null")
    @Min(value = 1, message = "Day number must be at least 1")
    Integer dayNumber,

    String notes
) {}
