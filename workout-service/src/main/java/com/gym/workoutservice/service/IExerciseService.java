package com.gym.workoutservice.service;

import com.gym.workoutservice.dto.ExerciseRequest;
import com.gym.workoutservice.dto.ExerciseResponse;

import java.util.List;

public interface IExerciseService {
    ExerciseResponse createExercise(ExerciseRequest request);
    ExerciseResponse updateExercise(Long id, ExerciseRequest request);
    List<ExerciseResponse> getAllExercises();
    ExerciseResponse getExerciseById(Long id);
    void deleteExercise(Long id);
}
