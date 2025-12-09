package com.gym.workoutservice.controller;

import com.gym.workoutservice.dto.AssignedWorkoutPlanRequest;
import com.gym.workoutservice.dto.AssignedWorkoutPlanResponse;
import com.gym.workoutservice.service.IAssignedWorkoutPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/workout/assign")
@RequiredArgsConstructor
public class AssignedWorkoutPlanController {

    private final IAssignedWorkoutPlanService assignedWorkoutPlanService;

    @PostMapping
    public ResponseEntity<AssignedWorkoutPlanResponse> assignWorkoutPlan(@Valid @RequestBody AssignedWorkoutPlanRequest request) {
        AssignedWorkoutPlanResponse response = assignedWorkoutPlanService.assignWorkoutPlan(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Update is a more general operation, can be used to replace or change status
    @PutMapping("/{id}")
    public ResponseEntity<AssignedWorkoutPlanResponse> updateAssignedWorkoutPlan(@PathVariable Long id, @Valid @RequestBody AssignedWorkoutPlanRequest request) {
        AssignedWorkoutPlanResponse response = assignedWorkoutPlanService.updateAssignedWorkoutPlan(id, request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // API to cancel an assigned plan
    @PutMapping("/{id}/cancel")
    public ResponseEntity<AssignedWorkoutPlanResponse> cancelAssignedWorkoutPlan(@PathVariable Long id) {
        AssignedWorkoutPlanResponse response = assignedWorkoutPlanService.cancelAssignedWorkoutPlan(id);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssignedWorkoutPlanResponse> getAssignedWorkoutPlanById(@PathVariable Long id) {
        AssignedWorkoutPlanResponse response = assignedWorkoutPlanService.getAssignedWorkoutPlanById(id);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<AssignedWorkoutPlanResponse>> getAssignedWorkoutPlansByMemberId(@PathVariable Long memberId) {
        List<AssignedWorkoutPlanResponse> response = assignedWorkoutPlanService.getAssignedWorkoutPlansByMemberId(memberId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/member/{memberId}/current-plan")
    public ResponseEntity<AssignedWorkoutPlanResponse> getCurrentAssignedWorkoutPlanForMember(@PathVariable Long memberId) {
        AssignedWorkoutPlanResponse response = assignedWorkoutPlanService.getCurrentAssignedWorkoutPlanForMember(memberId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<List<AssignedWorkoutPlanResponse>> getAssignedWorkoutPlansByTrainerId(@PathVariable Long trainerId) {
        List<AssignedWorkoutPlanResponse> response = assignedWorkoutPlanService.getAssignedWorkoutPlansByTrainerId(trainerId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Admin endpoint to fully delete an assignment
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssignedWorkoutPlan(@PathVariable Long id) {
        assignedWorkoutPlanService.deleteAssignedWorkoutPlan(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
