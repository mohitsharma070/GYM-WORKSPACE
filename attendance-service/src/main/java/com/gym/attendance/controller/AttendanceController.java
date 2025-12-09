package com.gym.attendance.controller;

import com.gym.attendance.entity.Attendance;
import com.gym.attendance.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/attendances")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @Autowired
    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
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
