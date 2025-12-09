package com.gym.workoutservice.dto;

import java.time.LocalDateTime;
import java.util.Set;

public record WorkoutDayResponse(
    Long id,
    Long planId, // Direct reference to the parent plan's ID
    Integer dayNumber,
    String notes,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    Set<WorkoutExerciseResponse> workoutExercises // Nested exercises for this day
) {}
