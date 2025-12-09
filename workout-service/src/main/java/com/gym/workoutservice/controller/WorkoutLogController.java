package com.gym.workoutservice.controller;

import com.gym.workoutservice.dto.WorkoutLogRequest;
import com.gym.workoutservice.dto.WorkoutLogResponse;
import com.gym.workoutservice.service.IWorkoutLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/workout/logs")
@RequiredArgsConstructor
public class WorkoutLogController {

    private final IWorkoutLogService workoutLogService;

    @PostMapping
    public ResponseEntity<WorkoutLogResponse> submitWorkoutLog(@Valid @RequestBody WorkoutLogRequest request) {
        WorkoutLogResponse response = workoutLogService.submitWorkoutLog(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkoutLogResponse> updateWorkoutLog(@PathVariable Long id, @Valid @RequestBody WorkoutLogRequest request) {
        WorkoutLogResponse response = workoutLogService.updateWorkoutLog(id, request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutLogResponse> getWorkoutLogById(@PathVariable Long id) {
        WorkoutLogResponse response = workoutLogService.getWorkoutLogById(id);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<WorkoutLogResponse>> getWorkoutLogsByMemberId(@PathVariable Long memberId) {
        List<WorkoutLogResponse> response = workoutLogService.getWorkoutLogsByMemberId(memberId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkoutLog(@PathVariable Long id) {
        workoutLogService.deleteWorkoutLog(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
