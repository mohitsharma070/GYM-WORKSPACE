package com.gym.attendance.service;

import com.gym.attendance.entity.Attendance;
import java.util.List;
import java.util.Optional;

public interface AttendanceService {
    Attendance checkInWithFingerprint(String fingerprintData);
    List<Attendance> getAllAttendances();
    Optional<Attendance> getAttendanceById(Long id);
    List<Attendance> getAttendancesByUserId(Long userId);
}