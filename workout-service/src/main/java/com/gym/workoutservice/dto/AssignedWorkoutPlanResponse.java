package com.gym.workoutservice.dto;

import com.gym.workoutservice.entity.AssignedWorkoutPlan;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AssignedWorkoutPlanResponse(
    Long id,
    Long memberId,
    WorkoutPlanResponse workoutPlan, // Nested workout plan details
    Long assignedByTrainerId,
    LocalDate startDate,
    LocalDate endDate,
    AssignedWorkoutPlan.AssignmentStatus status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
