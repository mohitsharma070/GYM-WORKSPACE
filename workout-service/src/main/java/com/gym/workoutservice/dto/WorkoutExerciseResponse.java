package com.gym.workoutservice.dto;

import java.time.LocalDateTime;

public record WorkoutExerciseResponse(
    Long id,
    Long workoutDayId, // Direct reference to the parent day's ID
    ExerciseResponse exercise, // Nested Exercise details
    Integer sets,
    String reps,
    Integer restTimeInSeconds,
    Integer orderInDay,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
