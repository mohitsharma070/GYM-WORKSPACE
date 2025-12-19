package com.gym.attendance.controller;

import com.gym.attendance.dto.CheckInRequest;
import com.gym.attendance.entity.Attendance;
import com.gym.attendance.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendances")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @Autowired
    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/check-in")
    public ResponseEntity<Attendance> checkIn(@RequestBody CheckInRequest checkInRequest) {
        return new ResponseEntity<>(attendanceService.checkIn(checkInRequest.getUserId()), HttpStatus.CREATED);
    }

    @PostMapping("/check-out/{id}")
    public ResponseEntity<Attendance> checkOut(@PathVariable Long id) {
        return new ResponseEntity<>(attendanceService.checkOut(id), HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<Attendance>> getAllAttendances() {
        return new ResponseEntity<>(attendanceService.getAllAttendances(), HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Attendance>> getAttendancesByUserId(@PathVariable Long userId) {
        return new ResponseEntity<>(attendanceService.getAttendancesByUserId(userId), HttpStatus.OK);
    }
}
