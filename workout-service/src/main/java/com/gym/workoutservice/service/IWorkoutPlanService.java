package com.gym.workoutservice.service;

import com.gym.workoutservice.dto.WorkoutDayRequest;
import com.gym.workoutservice.dto.WorkoutDayResponse;
import com.gym.workoutservice.dto.WorkoutDayWithExercisesRequest;
import com.gym.workoutservice.dto.WorkoutPlanRequest;
import com.gym.workoutservice.dto.WorkoutPlanResponse;
import com.gym.workoutservice.dto.WorkoutExerciseRequest;
import com.gym.workoutservice.entity.Exercise;

import java.util.List;
import java.util.Set;

public interface IWorkoutPlanService {
    // Workout Plan CRUD
    WorkoutPlanResponse createWorkoutPlan(WorkoutPlanRequest request);
    WorkoutPlanResponse updateWorkoutPlan(Long id, WorkoutPlanRequest request);
    void deleteWorkoutPlan(Long id);
    List<WorkoutPlanResponse> getAllWorkoutPlans();
    WorkoutPlanResponse getWorkoutPlanById(Long id);
    List<WorkoutPlanResponse> getWorkoutPlansByTrainer(Long trainerId);
    List<WorkoutPlanResponse> getWorkoutPlansByDifficulty(Exercise.Difficulty difficulty);


    // Workout Day Management
    WorkoutDayResponse addWorkoutDayToPlan(Long planId, WorkoutDayWithExercisesRequest request);
    WorkoutDayResponse updateWorkoutDay(Long planId, Long dayId, WorkoutDayWithExercisesRequest request);
    void deleteWorkoutDay(Long planId, Long dayId);
    Set<WorkoutDayResponse> getWorkoutDaysByPlanId(Long planId);


    // Workout Exercise Management (within a day)
    WorkoutDayResponse addExerciseToWorkoutDay(Long planId, Long dayId, WorkoutExerciseRequest request);
    WorkoutDayResponse updateWorkoutExercise(Long planId, Long dayId, Long exerciseId, WorkoutExerciseRequest request);
    void removeExerciseFromWorkoutDay(Long planId, Long dayId, Long exerciseId);
}
