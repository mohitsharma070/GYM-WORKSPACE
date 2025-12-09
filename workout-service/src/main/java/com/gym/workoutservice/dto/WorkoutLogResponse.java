package com.gym.workoutservice.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record WorkoutLogResponse(
    Long id,
    Long memberId,
    ExerciseResponse exercise, // Nested Exercise details
    LocalDate logDate,
    Integer actualSets,
    String actualReps,
    String notes,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
