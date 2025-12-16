package com.gym.workoutservice.repository;

import com.gym.workoutservice.entity.AssignedWorkoutPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssignedWorkoutPlanRepository extends JpaRepository<AssignedWorkoutPlan, Long> {
    List<AssignedWorkoutPlan> findByMemberId(Long memberId);
    Optional<AssignedWorkoutPlan> findByMemberIdAndStatus(Long memberId, AssignedWorkoutPlan.AssignmentStatus status);

    @Query("SELECT p FROM AssignedWorkoutPlan p WHERE p.status = 'ACTIVE' AND p.startDate <= :date AND (p.endDate IS NULL OR p.endDate >= :date)")
    List<AssignedWorkoutPlan> findActivePlansForDate(@Param("date") LocalDate date);
    boolean existsByMemberIdAndStatus(Long memberId, AssignedWorkoutPlan.AssignmentStatus status);
    List<AssignedWorkoutPlan> findByAssignedByTrainerId(Long trainerId);
}
