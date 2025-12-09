package com.gym.workoutservice.dto;

import com.gym.workoutservice.entity.Exercise;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class WorkoutDayExerciseDTO {
    private Long id; // workout_exercise.id
    private Long planId;
    private String planName;
    private Long dayId;
    private int dayNumber;
    private Long exerciseId;
    private int orderInDay;
    private String exerciseName;
    private int sets;
    private String reps;
    private int restTimeInSeconds;
    private Exercise.BodyPart bodyPart;
}
