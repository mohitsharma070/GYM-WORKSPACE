package com.gym.attendance.service.impl;

import com.gym.attendance.client.MembershipServiceFeignClient;
import com.gym.attendance.client.UserServiceFeignClient;
import com.gym.attendance.entity.Attendance;
import com.gym.attendance.payload.response.MembershipResponse;
import com.gym.attendance.repository.AttendanceRepository;
import com.gym.attendance.service.AttendanceService;
import com.gym.attendance.service.FingerprintService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserServiceFeignClient userServiceFeignClient;
    private final MembershipServiceFeignClient membershipServiceFeignClient;
    private final FingerprintService fingerprintService;

    @Override
    public Attendance checkInWithFingerprint(String fingerprintData) {
        Optional<Long> userIdOptional = fingerprintService.verifyFingerprint(fingerprintData);
        if (userIdOptional.isEmpty()) {
            throw new IllegalArgumentException("Fingerprint not recognized.");
        }
        Long userId = userIdOptional.get();

        Optional<MembershipResponse> membershipOptional = membershipServiceFeignClient.findActiveMembershipByUserId(userId);
        if (membershipOptional.isEmpty()) {
            throw new IllegalArgumentException("No active membership found for user with ID: " + userId);
        }

        Attendance attendance = new Attendance();
        attendance.setUserId(userId);
        attendance.setTimestamp(LocalDateTime.now());
        return attendanceRepository.save(attendance);
    }

    @Override
    public List<Attendance> getAllAttendances() {
        return attendanceRepository.findAll();
    }

    @Override
    public Optional<Attendance> getAttendanceById(Long id) {
        return attendanceRepository.findById(id);
    }

    @Override
    public List<Attendance> getAttendancesByUserId(Long userId) {
        return attendanceRepository.findByUserId(userId);
    }
}
