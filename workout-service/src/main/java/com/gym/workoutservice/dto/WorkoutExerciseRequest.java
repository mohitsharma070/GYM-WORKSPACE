package com.gym.workoutservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotBlank;

public record WorkoutExerciseRequest(
    @NotNull(message = "Exercise ID cannot be null")
    Long exerciseId,

    @NotNull(message = "Sets cannot be null")
    @Min(value = 1, message = "Sets must be at least 1")
    Integer sets,

    @NotBlank(message = "Reps cannot be empty")
    @Size(max = 50, message = "Reps cannot exceed 50 characters")
    String reps,

    @Min(value = 0, message = "Rest time cannot be negative")
    Integer restTimeInSeconds,

    @NotNull(message = "Order in day cannot be null")
    @Min(value = 1, message = "Order in day must be at least 1")
    Integer orderInDay
) {}
