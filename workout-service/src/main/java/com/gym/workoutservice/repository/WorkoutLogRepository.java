package com.gym.workoutservice.repository;

import com.gym.workoutservice.entity.WorkoutLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {
    List<WorkoutLog> findByMemberId(Long memberId);
    Optional<WorkoutLog> findByMemberIdAndExerciseIdAndLogDate(Long memberId, Long exerciseId, LocalDate logDate);
}
