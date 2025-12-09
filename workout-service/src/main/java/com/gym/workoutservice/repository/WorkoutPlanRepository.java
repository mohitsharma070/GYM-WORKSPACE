package com.gym.workoutservice.repository;

import com.gym.workoutservice.dto.WorkoutDayExerciseDTO;
import com.gym.workoutservice.entity.Exercise;
import com.gym.workoutservice.entity.WorkoutPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, Long> {
    List<WorkoutPlan> findByCreatedByTrainerId(Long trainerId);
    List<WorkoutPlan> findByDifficulty(Exercise.Difficulty difficulty);
    Optional<WorkoutPlan> findByName(String name);
    boolean existsByName(String name);

    @Query("SELECT new com.gym.workoutservice.dto.WorkoutDayExerciseDTO(" +
            "we.id, wp.id, wp.name, wd.id, wd.dayNumber, " +
            "we.exercise.id, we.orderInDay, e.name, we.sets, " +
            "we.reps, we.restTimeInSeconds, e.bodyPart) " +
            "FROM WorkoutPlan wp " +
            "JOIN wp.workoutDays wd " +
            "JOIN wd.workoutExercises we " +
            "JOIN we.exercise e " +
            "WHERE wp.difficulty = :difficulty " +
            "ORDER BY wd.dayNumber, we.orderInDay")
    List<WorkoutDayExerciseDTO> getPlanByDifficulty(@Param("difficulty") Exercise.Difficulty difficulty);
}
