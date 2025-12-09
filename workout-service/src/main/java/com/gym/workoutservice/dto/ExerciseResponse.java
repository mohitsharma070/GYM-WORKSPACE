package com.gym.workoutservice.dto;

import com.gym.workoutservice.entity.Exercise;
import java.time.LocalDateTime;

public record ExerciseResponse(
    Long id,
    String name,
    Exercise.BodyPart bodyPart,
    Exercise.Equipment equipment,
    Exercise.Difficulty difficulty,
    String videoUrl,
    String description,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
