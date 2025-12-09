package com.gym.workoutservice.repository;

import com.gym.workoutservice.entity.AssignedWorkoutPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssignedWorkoutPlanRepository extends JpaRepository<AssignedWorkoutPlan, Long> {
    List<AssignedWorkoutPlan> findByMemberId(Long memberId);
    Optional<AssignedWorkoutPlan> findByMemberIdAndStatus(Long memberId, AssignedWorkoutPlan.AssignmentStatus status);
    boolean existsByMemberIdAndStatus(Long memberId, AssignedWorkoutPlan.AssignmentStatus status);
    List<AssignedWorkoutPlan> findByAssignedByTrainerId(Long trainerId);
}
