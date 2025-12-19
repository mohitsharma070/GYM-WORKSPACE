package com.gym.attendance.repository;

import com.gym.attendance.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.time.LocalDateTime;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByUserId(Long userId);
    List<Attendance> findByUserIdOrderByCheckInTimeDesc(Long userId);
    List<Attendance> findByUserIdAndCheckInTimeBetween(Long userId, LocalDateTime start, LocalDateTime end);
}