package com.gym.attendance.controller;

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

@RestController
@RequestMapping("/api/fingerprints")
public class FingerprintController {

    private final FingerprintService fingerprintService;
    private final AttendanceService attendanceService;

    @Autowired
    public FingerprintController(FingerprintService fingerprintService, AttendanceService attendanceService) {
        this.fingerprintService = fingerprintService;
        this.attendanceService = attendanceService;
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
            Attendance attendance = attendanceService.checkInWithFingerprint(request.getFingerprintData());
            return new ResponseEntity<>(attendance, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
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
