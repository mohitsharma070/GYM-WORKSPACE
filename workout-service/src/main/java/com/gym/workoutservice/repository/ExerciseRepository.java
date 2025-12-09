package com.gym.workoutservice.repository;

import com.gym.workoutservice.entity.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    Optional<Exercise> findByName(String name);
    boolean existsByName(String name);
}
