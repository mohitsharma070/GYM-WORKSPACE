package com.gym.workoutservice.dto;

import com.gym.workoutservice.entity.WorkoutLog;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record WorkoutLogRequest(
    @NotNull(message = "Member ID cannot be null")
    Long memberId,

    @NotNull(message = "Exercise ID cannot be null")
    Long exerciseId,

    @NotNull(message = "Log date cannot be null")
    @FutureOrPresent(message = "Log date cannot be in the past")
    LocalDate logDate,

    @Min(value = 0, message = "Actual sets cannot be negative")
    Integer actualSets,

    @Size(max = 50, message = "Actual reps cannot exceed 50 characters")
    String actualReps,

    String notes,

    WorkoutLog.WorkoutStatus status,
    
    Long completedByTrainerId
) {}
