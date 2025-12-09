package com.gym.workoutservice.service;

import com.gym.workoutservice.dto.AssignedWorkoutPlanRequest;
import com.gym.workoutservice.dto.AssignedWorkoutPlanResponse;
import com.gym.workoutservice.entity.AssignedWorkoutPlan;

import java.util.List;

public interface IAssignedWorkoutPlanService {
    AssignedWorkoutPlanResponse assignWorkoutPlan(AssignedWorkoutPlanRequest request);
    AssignedWorkoutPlanResponse updateAssignedWorkoutPlan(Long id, AssignedWorkoutPlanRequest request);
    AssignedWorkoutPlanResponse cancelAssignedWorkoutPlan(Long id);
    AssignedWorkoutPlanResponse getAssignedWorkoutPlanById(Long id);
    List<AssignedWorkoutPlanResponse> getAssignedWorkoutPlansByMemberId(Long memberId);
    AssignedWorkoutPlanResponse getCurrentAssignedWorkoutPlanForMember(Long memberId);
    List<AssignedWorkoutPlanResponse> getAssignedWorkoutPlansByTrainerId(Long trainerId);
    void deleteAssignedWorkoutPlan(Long id); // Admin use
}
