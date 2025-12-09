package com.gym.workoutservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Set;

public record WorkoutDayWithExercisesRequest(
    // Plan ID is often passed as a path variable for this
    
    @NotNull(message = "Day number cannot be null")
    @Min(value = 1, message = "Day number must be at least 1")
    Integer dayNumber,

    String notes,

    @NotNull(message = "Workout exercises cannot be null")
    @Size(min = 1, message = "At least one exercise must be present")
    Set<@Valid WorkoutExerciseRequest> workoutExercises
) {}
