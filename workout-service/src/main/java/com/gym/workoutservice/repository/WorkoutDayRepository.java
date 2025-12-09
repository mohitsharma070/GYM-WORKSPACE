package com.gym.workoutservice.repository;

import com.gym.workoutservice.entity.WorkoutDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface WorkoutDayRepository extends JpaRepository<WorkoutDay, Long> {
    Optional<WorkoutDay> findByWorkoutPlanIdAndDayNumber(Long planId, Integer dayNumber);
    Set<WorkoutDay> findByWorkoutPlanId(Long planId);
}
