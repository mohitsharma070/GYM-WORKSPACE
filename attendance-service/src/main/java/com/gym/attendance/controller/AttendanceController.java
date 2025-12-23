package com.gym.attendance.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gym.attendance.dto.CheckInRequest;
import com.gym.attendance.entity.Attendance;
import com.gym.attendance.service.AttendanceService;
import com.gym.attendance.specification.AttendanceSpecification;

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


    // New paginated, sorted, filtered endpoint
    @GetMapping("/paged")
    public ResponseEntity<Page<Attendance>> getAllAttendancesPaged(
            @RequestParam(required = false) Long userId,
            @PageableDefault(size = 20, sort = "checkInTime") Pageable pageable) {
        Specification<Attendance> spec = (***REMOVED***, query, cb) -> cb.conjunction();
        if (userId != null) {
            spec = spec.and(AttendanceSpecification.hasUserId(userId));
        }
        // Add more filters as needed
        return new ResponseEntity<>(attendanceService.getAllAttendances(spec, pageable), HttpStatus.OK);
    }


    // New paginated endpoint for userId
    @GetMapping("/user/{userId}/paged")
    public ResponseEntity<Page<Attendance>> getAttendancesByUserIdPaged(
            @PathVariable Long userId,
            @PageableDefault(size = 20, sort = "checkInTime") Pageable pageable) {
        return new ResponseEntity<>(attendanceService.getAttendancesByUserId(userId, pageable), HttpStatus.OK);
    }
}
