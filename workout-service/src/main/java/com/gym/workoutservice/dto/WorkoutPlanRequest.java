package com.gym.workoutservice.dto;

import com.gym.workoutservice.entity.Exercise;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record WorkoutPlanRequest(
    @NotBlank(message = "Workout plan name cannot be empty")
    @Size(max = 255, message = "Workout plan name cannot exceed 255 characters")
    String name,

    String description,

    @NotNull(message = "Difficulty cannot be null")
    Exercise.Difficulty difficulty,

    // Assuming this ID comes from an authenticated user or passed from frontend
    // Will be null for admin-created plans, otherwise required for trainers
    Long createdByTrainerId,

    Boolean isActive // Optional, defaults to true in entity
) {}
