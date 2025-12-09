package com.gym.workoutservice.controller;

import com.gym.workoutservice.dto.WorkoutDayResponse;
import com.gym.workoutservice.dto.WorkoutDayWithExercisesRequest;
import com.gym.workoutservice.dto.WorkoutExerciseRequest;
import com.gym.workoutservice.dto.WorkoutPlanRequest;
import com.gym.workoutservice.dto.WorkoutPlanResponse;
import com.gym.workoutservice.entity.Exercise;
import com.gym.workoutservice.service.IWorkoutPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/workout/plans")
@RequiredArgsConstructor
public class WorkoutPlanController {

    private final IWorkoutPlanService workoutPlanService;

    // --- Workout Plan APIs ---
    @PostMapping
    public ResponseEntity<WorkoutPlanResponse> createWorkoutPlan(@Valid @RequestBody WorkoutPlanRequest request) {
        WorkoutPlanResponse response = workoutPlanService.createWorkoutPlan(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<WorkoutPlanResponse>> getAllWorkoutPlans(
        @RequestParam(required = false) Long trainerId,
        @RequestParam(required = false) Exercise.Difficulty difficulty
    ) {
        List<WorkoutPlanResponse> response;
        if (trainerId != null) {
            response = workoutPlanService.getWorkoutPlansByTrainer(trainerId);
        } else if (difficulty != null) {
            response = workoutPlanService.getWorkoutPlansByDifficulty(difficulty);
        } else {
            response = workoutPlanService.getAllWorkoutPlans();
        }
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutPlanResponse> getWorkoutPlanById(@PathVariable Long id) {
        WorkoutPlanResponse response = workoutPlanService.getWorkoutPlanById(id);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkoutPlanResponse> updateWorkoutPlan(@PathVariable Long id, @Valid @RequestBody WorkoutPlanRequest request) {
        WorkoutPlanResponse response = workoutPlanService.updateWorkoutPlan(id, request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkoutPlan(@PathVariable Long id) {
        workoutPlanService.deleteWorkoutPlan(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // --- Workout Day APIs (nested under plan) ---
    @PostMapping("/{planId}/days")
    public ResponseEntity<WorkoutDayResponse> addWorkoutDayToPlan(
        @PathVariable Long planId,
        @Valid @RequestBody WorkoutDayWithExercisesRequest request
    ) {
        WorkoutDayResponse response = workoutPlanService.addWorkoutDayToPlan(planId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{planId}/days/{dayId}")
    public ResponseEntity<WorkoutDayResponse> updateWorkoutDay(
        @PathVariable Long planId,
        @PathVariable Long dayId,
        @Valid @RequestBody WorkoutDayWithExercisesRequest request
    ) {
        WorkoutDayResponse response = workoutPlanService.updateWorkoutDay(planId, dayId, request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/{planId}/days/{dayId}")
    public ResponseEntity<Void> deleteWorkoutDay(
        @PathVariable Long planId,
        @PathVariable Long dayId
    ) {
        workoutPlanService.deleteWorkoutDay(planId, dayId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/{planId}/days")
    public ResponseEntity<Set<WorkoutDayResponse>> getWorkoutDaysByPlanId(@PathVariable Long planId) {
        Set<WorkoutDayResponse> response = workoutPlanService.getWorkoutDaysByPlanId(planId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // --- Workout Exercise APIs (nested under day) ---
    @PostMapping("/{planId}/days/{dayId}/exercises")
    public ResponseEntity<WorkoutDayResponse> addExerciseToWorkoutDay(
        @PathVariable Long planId,
        @PathVariable Long dayId,
        @Valid @RequestBody WorkoutExerciseRequest request
    ) {
        WorkoutDayResponse response = workoutPlanService.addExerciseToWorkoutDay(planId, dayId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{planId}/days/{dayId}/exercises/{exerciseId}")
    public ResponseEntity<WorkoutDayResponse> updateWorkoutExercise(
        @PathVariable Long planId,
        @PathVariable Long dayId,
        @PathVariable Long exerciseId,
        @Valid @RequestBody WorkoutExerciseRequest request
    ) {
        WorkoutDayResponse response = workoutPlanService.updateWorkoutExercise(planId, dayId, exerciseId, request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/{planId}/days/{dayId}/exercises/{exerciseId}")
    public ResponseEntity<Void> removeExerciseFromWorkoutDay(
        @PathVariable Long planId,
        @PathVariable Long dayId,
        @PathVariable Long exerciseId
    ) {
        workoutPlanService.removeExerciseFromWorkoutDay(planId, dayId, exerciseId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
