package com.gym.attendance.service;


import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import com.gym.attendance.entity.Attendance;

public interface AttendanceService {
    Attendance checkIn(Long userId);
    Attendance checkOut(Long id);
    Page<Attendance> getAllAttendances(Specification<Attendance> spec, Pageable pageable);
    Optional<Attendance> getAttendanceById(Long id);
    Page<Attendance> getAttendancesByUserId(Long userId, Pageable pageable);
    // Legacy methods for backward compatibility
    List<Attendance> getAllAttendances();
    List<Attendance> getAttendancesByUserId(Long userId);
}