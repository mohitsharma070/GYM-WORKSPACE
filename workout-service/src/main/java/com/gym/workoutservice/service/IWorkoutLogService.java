package com.gym.workoutservice.service;

import com.gym.workoutservice.dto.WorkoutLogRequest;
import com.gym.workoutservice.dto.WorkoutLogResponse;

import java.util.List;

public interface IWorkoutLogService {
    WorkoutLogResponse submitWorkoutLog(WorkoutLogRequest request);
    WorkoutLogResponse updateWorkoutLog(Long id, WorkoutLogRequest request);
    WorkoutLogResponse getWorkoutLogById(Long id);
    List<WorkoutLogResponse> getWorkoutLogsByMemberId(Long memberId);
    void deleteWorkoutLog(Long id);
}
