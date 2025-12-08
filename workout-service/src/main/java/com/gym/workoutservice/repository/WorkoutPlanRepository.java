package com.gym.workoutservice.repository;

import com.gym.workoutservice.entity.Exercise;
import com.gym.workoutservice.entity.WorkoutPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, Long> {
    List<WorkoutPlan> findByCreatedByTrainerId(Long trainerId);
    List<WorkoutPlan> findByDifficulty(Exercise.Difficulty difficulty);
    Optional<WorkoutPlan> findByName(String name);
    boolean existsByName(String name);
}
