package com.gym.workoutservice.service.impl;

import com.gym.workoutservice.client.UserClient;
import com.gym.workoutservice.client.UserClient.UserResponse;
import com.gym.workoutservice.dto.AssignedWorkoutPlanRequest;
import com.gym.workoutservice.dto.AssignedWorkoutPlanResponse;
import com.gym.workoutservice.dto.WorkoutPlanResponse;
import com.gym.workoutservice.entity.AssignedWorkoutPlan;
import com.gym.workoutservice.entity.WorkoutPlan;
import com.gym.workoutservice.exception.BadRequestException;
import com.gym.workoutservice.exception.ConflictException;
import com.gym.workoutservice.exception.ResourceNotFoundException;
import com.gym.workoutservice.repository.AssignedWorkoutPlanRepository;
import com.gym.workoutservice.repository.WorkoutPlanRepository;
import com.gym.workoutservice.service.IAssignedWorkoutPlanService;
import com.gym.workoutservice.service.IWorkoutPlanService; // Injecting interface
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignedWorkoutPlanServiceImpl implements IAssignedWorkoutPlanService {

    private final AssignedWorkoutPlanRepository assignedWorkoutPlanRepository;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final IWorkoutPlanService workoutPlanService; // Inject interface for mapping
    private final UserClient userClient; // Inject UserClient

    @Override
    @Transactional
    public AssignedWorkoutPlanResponse assignWorkoutPlan(AssignedWorkoutPlanRequest request) {
        WorkoutPlan workoutPlan = workoutPlanRepository.findById(request.planId())
                .orElseThrow(() -> new ResourceNotFoundException("Workout plan not found with id: " + request.planId()));

        if (!userClient.userExists(request.memberId())) {
            throw new ResourceNotFoundException("Member with id " + request.memberId() + " not found.");
        }

        // Check if member already has an ACTIVE plan
        if (assignedWorkoutPlanRepository.existsByMemberIdAndStatus(request.memberId(), AssignedWorkoutPlan.AssignmentStatus.ACTIVE)) {
            throw new ConflictException("Member with id " + request.memberId() + " already has an active workout plan. Please cancel the current plan before assigning a new one.");
        }

        if (request.assignedByTrainerId() != null) {
            UserResponse trainer = userClient.getUserById(request.assignedByTrainerId());
            if (trainer == null || !"ROLE_TRAINER".equals(trainer.role)) {
                throw new BadRequestException("Only users with ROLE_TRAINER can assign workout plans.");
            }
        }

        AssignedWorkoutPlan assignedPlan = new AssignedWorkoutPlan();
        assignedPlan.setMemberId(request.memberId());
        assignedPlan.setWorkoutPlan(workoutPlan);
        assignedPlan.setAssignedByTrainerId(request.assignedByTrainerId());
        assignedPlan.setStartDate(request.startDate());
        assignedPlan.setEndDate(request.endDate());
        assignedPlan.setStatus(request.status() != null ? request.status() : AssignedWorkoutPlan.AssignmentStatus.ACTIVE);

        AssignedWorkoutPlan saved = assignedWorkoutPlanRepository.save(assignedPlan);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public AssignedWorkoutPlanResponse updateAssignedWorkoutPlan(Long id, AssignedWorkoutPlanRequest request) {
        AssignedWorkoutPlan assignedPlan = assignedWorkoutPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assigned workout plan not found with id: " + id));

        WorkoutPlan newWorkoutPlan = workoutPlanRepository.findById(request.planId())
                .orElseThrow(() -> new ResourceNotFoundException("Workout plan not found with id: " + request.planId()));
        
        if (!userClient.userExists(request.memberId())) {
            throw new ResourceNotFoundException("Member with id " + request.memberId() + " not found.");
        }

        // Check for conflict if trying to change to a plan that is already active for the member (unless it's the same plan)
        if (!assignedPlan.getWorkoutPlan().getId().equals(request.planId()) &&
            assignedWorkoutPlanRepository.existsByMemberIdAndStatus(request.memberId(), AssignedWorkoutPlan.AssignmentStatus.ACTIVE)) {
            throw new ConflictException("Member with id " + request.memberId() + " already has an active workout plan. Cannot assign another active plan.");
        }

        if (request.assignedByTrainerId() != null && !assignedPlan.getAssignedByTrainerId().equals(request.assignedByTrainerId())) {
            UserResponse trainer = userClient.getUserById(request.assignedByTrainerId());
            if (trainer == null || !"ROLE_TRAINER".equals(trainer.role)) {
                throw new BadRequestException("Only users with ROLE_TRAINER can be assigned as plan assigners.");
            }
        }


        assignedPlan.setMemberId(request.memberId());
        assignedPlan.setWorkoutPlan(newWorkoutPlan);
        assignedPlan.setAssignedByTrainerId(request.assignedByTrainerId());
        assignedPlan.setStartDate(request.startDate());
        assignedPlan.setEndDate(request.endDate());
        assignedPlan.setStatus(request.status() != null ? request.status() : assignedPlan.getStatus());

        AssignedWorkoutPlan updated = assignedWorkoutPlanRepository.save(assignedPlan);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public AssignedWorkoutPlanResponse cancelAssignedWorkoutPlan(Long id) {
        AssignedWorkoutPlan assignedPlan = assignedWorkoutPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assigned workout plan not found with id: " + id));

        if (assignedPlan.getStatus().equals(AssignedWorkoutPlan.AssignmentStatus.CANCELLED)) {
            throw new BadRequestException("Assigned workout plan with id: " + id + " is already cancelled.");
        }

        assignedPlan.setStatus(AssignedWorkoutPlan.AssignmentStatus.CANCELLED);
        AssignedWorkoutPlan cancelled = assignedWorkoutPlanRepository.save(assignedPlan);
        return mapToResponse(cancelled);
    }

    @Override
    public AssignedWorkoutPlanResponse getAssignedWorkoutPlanById(Long id) {
        AssignedWorkoutPlan assignedPlan = assignedWorkoutPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assigned workout plan not found with id: " + id));
        return mapToResponse(assignedPlan);
    }

    @Override
    public List<AssignedWorkoutPlanResponse> getAssignedWorkoutPlansByMemberId(Long memberId) {
        return assignedWorkoutPlanRepository.findByMemberId(memberId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AssignedWorkoutPlanResponse getCurrentAssignedWorkoutPlanForMember(Long memberId) {
        return assignedWorkoutPlanRepository.findByMemberIdAndStatus(memberId, AssignedWorkoutPlan.AssignmentStatus.ACTIVE)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("No active assigned workout plan found for member with id: " + memberId));
    }

    @Override
    public List<AssignedWorkoutPlanResponse> getAssignedWorkoutPlansByTrainerId(Long trainerId) {
        return assignedWorkoutPlanRepository.findByAssignedByTrainerId(trainerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteAssignedWorkoutPlan(Long id) {
        if (!assignedWorkoutPlanRepository.existsById(id)) {
            throw new ResourceNotFoundException("Assigned workout plan not found with id: " + id);
        }
        assignedWorkoutPlanRepository.deleteById(id);
    }

    // Mapper
    private AssignedWorkoutPlanResponse mapToResponse(AssignedWorkoutPlan assignedPlan) {
        WorkoutPlanResponse workoutPlanResponse = workoutPlanService.getWorkoutPlanById(assignedPlan.getWorkoutPlan().getId()); // Get full plan details
        return new AssignedWorkoutPlanResponse(
                assignedPlan.getId(),
                assignedPlan.getMemberId(),
                workoutPlanResponse,
                assignedPlan.getAssignedByTrainerId(),
                assignedPlan.getStartDate(),
                assignedPlan.getEndDate(),
                assignedPlan.getStatus(),
                assignedPlan.getCreatedAt(),
                assignedPlan.getUpdatedAt()
        );
    }
}
