package com.gym.attendance.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.gym.attendance.entity.Attendance;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long>, JpaSpecificationExecutor<Attendance> {
    List<Attendance> findByUserId(Long userId);
    List<Attendance> findByUserIdOrderByCheckInTimeDesc(Long userId);
    List<Attendance> findByUserIdAndCheckInTimeBetween(Long userId, LocalDateTime start, LocalDateTime end);
    // Paging and filtering will use JpaSpecificationExecutor methods
}