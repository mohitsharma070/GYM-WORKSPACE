package com.gym.attendance.scheduler;

import com.gym.attendance.client.NotificationClient;
import com.gym.attendance.client.UserServiceFeignClient;
import com.gym.attendance.dto.NotificationRequest;
import com.gym.attendance.entity.Attendance;
import com.gym.attendance.repository.AttendanceRepository;
import com.gym.attendance.payload.response.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

import java.time.YearMonth;

@Component
@RequiredArgsConstructor
public class InactiveUserScheduler {

    private final UserServiceFeignClient userServiceFeignClient;
    private final AttendanceRepository attendanceRepository;
    private final NotificationClient notificationClient;

    private static final int INACTIVITY_DAYS = 30;

    @Scheduled(cron = "0 0 0 * * *") // Runs every day at midnight
    public void sendInactiveUserReminders() {
        List<UserResponse> users = userServiceFeignClient.getAllUsers();

        for (UserResponse user : users) {
            List<Attendance> userAttendances = attendanceRepository.findByUserIdOrderByCheckInTimeDesc(user.getId());

            if (userAttendances.isEmpty()) {
                // User has never checked in, send a reminder
                sendReminder(user);
            } else {
                // User has checked in before, check the last check-in time
                Attendance lastAttendance = userAttendances.get(0);
                if (lastAttendance.getCheckInTime().isBefore(LocalDateTime.now().minusDays(INACTIVITY_DAYS))) {
                    sendReminder(user);
                }
            }
        }
    }

    @Scheduled(cron = "0 0 0 1 * *") // Runs at midnight on the first day of every month
    public void sendMonthlyAttendanceSummary() {
        List<UserResponse> users = userServiceFeignClient.getAllUsers();
        YearMonth lastMonth = YearMonth.now().minusMonths(1);
        LocalDateTime start = lastMonth.atDay(1).atStartOfDay();
        LocalDateTime end = lastMonth.atEndOfMonth().atTime(23, 59, 59);

        for (UserResponse user : users) {
            if (user != null && user.getPhone() != null && !user.getPhone().isBlank()) {
                List<Attendance> monthlyAttendances = attendanceRepository.findByUserIdAndCheckInTimeBetween(user.getId(), start, end);
                int attendanceCount = monthlyAttendances.size();

                try {
                    NotificationRequest notification = new NotificationRequest();
                    notification.setPhoneNumber(user.getPhone());
                    notification.setType("MONTHLY_ATTENDANCE_SUMMARY");
                    // Compose message using template
                    String rendered = com.gym.attendance.util.TemplateUtil.renderTemplate(
                        "monthly_attendance_summary.html",
                        java.util.Map.of(
                            "userName", user.getName() != null ? user.getName() : "",
                            "month", lastMonth.getMonth().name(),
                            "year", String.valueOf(lastMonth.getYear()),
                            "attendanceCount", String.valueOf(attendanceCount)
                        )
                    );
                    if (rendered.isEmpty()) {
                        notification.setMessage("Hi " + user.getName() + ", here is your attendance summary for " + lastMonth.getMonth().name() + " " + lastMonth.getYear() + ". You visited the gym " + attendanceCount + " times. Keep up the great work!");
                    } else {
                        notification.setMessage(rendered);
                    }
                    notificationClient.sendNotification(notification);
                } catch (Exception e) {
                    System.err.println("Failed to send monthly attendance summary for user " + user.getId() + ": " + e.getMessage());
                }
            }
        }
    }

    private void sendReminder(UserResponse user) {
        if (user != null && user.getPhone() != null && !user.getPhone().isBlank()) {
            try {
                NotificationRequest notification = new NotificationRequest();
                notification.setPhoneNumber(user.getPhone());
                notification.setType("INACTIVE_USER_REMINDER");
                // Compose message using template
                String rendered = com.gym.attendance.util.TemplateUtil.renderTemplate(
                    "inactive_user_reminder.html",
                    java.util.Map.of(
                        "userName", user.getName() != null ? user.getName() : ""
                    )
                );
                if (rendered.isEmpty()) {
                    notification.setMessage("Hi " + user.getName() + ", we miss you! It's been a while since your last visit. We hope to see you soon.");
                } else {
                    notification.setMessage(rendered);
                }
                notificationClient.sendNotification(notification);
            } catch (Exception e) {
                System.err.println("Failed to send inactive user reminder notification for user " + user.getId() + ": " + e.getMessage());
            }
        }
    }
}
