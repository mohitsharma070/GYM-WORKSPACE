package com.gym.workoutservice.dto;

import com.gym.workoutservice.entity.Exercise;
import java.time.LocalDateTime;
import java.util.Set;

public record WorkoutPlanResponse(
    Long id,
    String name,
    String description,
    Exercise.Difficulty difficulty,
    Long createdByTrainerId,
    Boolean isActive,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    Set<WorkoutDayResponse> workoutDays // Nested workout days with exercises
) {}
