package com.gym.workoutservice.dto;

import com.gym.workoutservice.entity.Exercise;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ExerciseRequest(
    @NotBlank(message = "Exercise name cannot be empty")
    @Size(max = 255, message = "Exercise name cannot exceed 255 characters")
    String name,

    @NotNull(message = "Body part cannot be null")
    Exercise.BodyPart bodyPart,

    @NotNull(message = "Equipment cannot be null")
    Exercise.Equipment equipment,

    @NotNull(message = "Difficulty cannot be null")
    Exercise.Difficulty difficulty,

    @Size(max = 255, message = "Video URL cannot exceed 255 characters")
    String videoUrl,

    String description
) {}
