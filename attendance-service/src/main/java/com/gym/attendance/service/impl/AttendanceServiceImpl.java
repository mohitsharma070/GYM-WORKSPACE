
package com.gym.attendance.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.gym.attendance.client.MembershipServiceFeignClient;
import com.gym.attendance.client.NotificationClient;
import com.gym.attendance.client.UserServiceFeignClient;
import com.gym.attendance.dto.NotificationRequest;
import com.gym.attendance.entity.Attendance;
import com.gym.attendance.exception.ResourceNotFoundException;
import com.gym.attendance.payload.response.MembershipResponse;
import com.gym.attendance.payload.response.UserResponse;
import com.gym.attendance.repository.AttendanceRepository;
import com.gym.attendance.service.AttendanceService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    @Override
    public Page<Attendance> getAllAttendances(Specification<Attendance> spec, Pageable pageable) {
        return attendanceRepository.findAll(spec, pageable);
    }

    @Override
    public Page<Attendance> getAttendancesByUserId(Long userId, Pageable pageable) {
        Specification<Attendance> spec = (root, query, cb) -> cb.equal(root.get("userId"), userId);
        return attendanceRepository.findAll(spec, pageable);
    }

    private final AttendanceRepository attendanceRepository;
    private final UserServiceFeignClient userServiceFeignClient;
    private final MembershipServiceFeignClient membershipServiceFeignClient;
    private final NotificationClient notificationClient;

    @Override
    public Attendance checkIn(Long userId) {
        Optional<MembershipResponse> membershipOptional = membershipServiceFeignClient.findActiveMembershipByUserId(userId);
        if (membershipOptional.isEmpty()) {
            throw new IllegalArgumentException("No active membership found for user with ID: " + userId);
        }

        Attendance attendance = new Attendance();
        attendance.setUserId(userId);
        attendance.setCheckInTime(LocalDateTime.now());
        Attendance saved = attendanceRepository.save(attendance);

        // Send WhatsApp notification for attendance check-in
        try {
            UserResponse user = userServiceFeignClient.getUserById(userId);
            if (user != null && user.getPhone() != null && !user.getPhone().isBlank()) {
                NotificationRequest notification = new NotificationRequest();
                notification.setPhoneNumber(user.getPhone());
                notification.setType("ATTENDANCE_CHECK_IN");
                // Compose message using template
                String rendered = com.gym.attendance.util.TemplateUtil.renderTemplate(
                    "attendance_check_in.html",
                    java.util.Map.of(
                        "userName", user.getName() != null ? user.getName() : "",
                        "checkInTime", java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm").format(attendance.getCheckInTime())
                    )
                );
                if (rendered.isEmpty()) {
                    notification.setMessage("Hi " + user.getName() + ", your check-in has been recorded. Welcome!");
                } else {
                    notification.setMessage(rendered);
                }
                notificationClient.sendNotification(notification);
            }
        } catch (Exception e) {
            System.err.println("Failed to send attendance check-in notification: " + e.getMessage());
        }

        return saved;
    }

    @Override
    public Attendance checkOut(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with id: " + id));

        attendance.setCheckOutTime(LocalDateTime.now());
        Attendance saved = attendanceRepository.save(attendance);

        // Send WhatsApp notification for attendance check-out
        try {
            UserResponse user = userServiceFeignClient.getUserById(attendance.getUserId());
            if (user != null && user.getPhone() != null && !user.getPhone().isBlank()) {
                NotificationRequest notification = new NotificationRequest();
                notification.setPhoneNumber(user.getPhone());
                notification.setType("ATTENDANCE_CHECK_OUT");
                // Compose message using template
                String rendered = com.gym.attendance.util.TemplateUtil.renderTemplate(
                    "attendance_check_out.html",
                    java.util.Map.of(
                        "userName", user.getName() != null ? user.getName() : "",
                        "checkOutTime", java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm").format(attendance.getCheckOutTime() != null ? attendance.getCheckOutTime() : java.time.LocalDateTime.now())
                    )
                );
                if (rendered.isEmpty()) {
                    notification.setMessage("Hi " + user.getName() + ", your check-out has been recorded. Have a great day!");
                } else {
                    notification.setMessage(rendered);
                }
                notificationClient.sendNotification(notification);
            }
        } catch (Exception e) {
            System.err.println("Failed to send attendance check-out notification: " + e.getMessage());
        }

        return saved;
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
