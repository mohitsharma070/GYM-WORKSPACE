package com.gym.workoutservice.dto;

import com.gym.workoutservice.entity.AssignedWorkoutPlan;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record AssignedWorkoutPlanRequest(
    @NotNull(message = "Member ID cannot be null")
    Long memberId,

    @NotNull(message = "Plan ID cannot be null")
    Long planId,

    Long assignedByTrainerId, // Optional, can be null

    @NotNull(message = "Start date cannot be null")
    @FutureOrPresent(message = "Start date must be today or in the future")
    LocalDate startDate,

    LocalDate endDate,

    AssignedWorkoutPlan.AssignmentStatus status // Optional, defaults to ACTIVE
) {}
