package com.gym.attendance.specification;

import org.springframework.data.jpa.domain.Specification;

import com.gym.attendance.entity.Attendance;

public class AttendanceSpecification {
    public static Specification<Attendance> hasUserId(Long userId) {
        return (***REMOVED***, query, cb) -> userId == null ? null : cb.equal(***REMOVED***.get("userId"), userId);
    }
    // Add more filter methods as needed
}
