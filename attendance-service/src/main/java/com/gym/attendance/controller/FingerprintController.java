package com.gym.attendance.controller;


import com.gym.attendance.client.UserServiceFeignClient;
import com.gym.attendance.entity.*;
import com.gym.attendance.service.*;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fingerprints")
public class FingerprintController {

    private final FingerprintService fingerprintService;
    private final AttendanceService attendanceService;
    private final UserServiceFeignClient userServiceFeignClient;

    @Autowired
    public FingerprintController(FingerprintService fingerprintService, AttendanceService attendanceService, UserServiceFeignClient userServiceFeignClient) {
        this.fingerprintService = fingerprintService;
        this.attendanceService = attendanceService;
        this.userServiceFeignClient = userServiceFeignClient;
    }

    @PostMapping("/register")
    public ResponseEntity<Fingerprint> registerFingerprint(@RequestBody RegisterFingerprintRequest request) {
        try {
            Fingerprint registeredFingerprint = fingerprintService.registerFingerprint(request.getUserId(), request.getFingerprintData());
            return new ResponseEntity<>(registeredFingerprint, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/checkin")
    public ResponseEntity<Attendance> checkInWithFingerprint(@RequestBody CheckInWithFingerprintRequest request) {
        try {
            var userResponse = userServiceFeignClient.verifyFingerprint(Map.of("fingerprint", request.getFingerprintData()));
            Attendance attendance = attendanceService.checkIn(userResponse.getId());
            return new ResponseEntity<>(attendance, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<List<Attendance>> getAllAttendances() {
        return new ResponseEntity<>(attendanceService.getAllAttendances(), HttpStatus.OK);
    }
}

@Data
class RegisterFingerprintRequest {
    private Long userId;
    private String fingerprintData;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFingerprintData() {
        return fingerprintData;
    }

    public void setFingerprintData(String fingerprintData) {
        this.fingerprintData = fingerprintData;
    }
}

@Data
class CheckInWithFingerprintRequest {
    private String fingerprintData;

    public String getFingerprintData() {
        return fingerprintData;
    }

    public void setFingerprintData(String fingerprintData) {
        this.fingerprintData = fingerprintData;
    }
}
