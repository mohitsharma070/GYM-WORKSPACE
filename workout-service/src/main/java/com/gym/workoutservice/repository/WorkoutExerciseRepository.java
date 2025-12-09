package com.gym.workoutservice.repository;

import com.gym.workoutservice.entity.WorkoutExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface WorkoutExerciseRepository extends JpaRepository<WorkoutExercise, Long> {
    Set<WorkoutExercise> findByWorkoutDayId(Long workoutDayId);
    Optional<WorkoutExercise> findByWorkoutDayIdAndExerciseId(Long workoutDayId, Long exerciseId);
}
