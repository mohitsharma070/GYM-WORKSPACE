package com.gym.attendance.specification;

import org.springframework.data.jpa.domain.Specification;

import com.gym.attendance.entity.Attendance;

public class AttendanceSpecification {
    public static Specification<Attendance> hasUserId(Long userId) {
        return (root, query, cb) -> userId == null ? null : cb.equal(root.get("userId"), userId);
    }
    // Add more filter methods as needed
}
