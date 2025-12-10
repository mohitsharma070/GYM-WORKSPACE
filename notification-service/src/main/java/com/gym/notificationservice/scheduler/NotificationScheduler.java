package com.gym.notificationservice.scheduler;

import com.gym.notificationservice.entity.NotificationTemplate.NotificationType;
import com.gym.notificationservice.feign.MembershipServiceClient;
import com.gym.notificationservice.feign.UserServiceClient;
import com.gym.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {

    private final NotificationService notificationService;
    private final UserServiceClient userServiceClient;
    private final MembershipServiceClient membershipServiceClient;

    @Value("${notification.inactive-user.days}")
    private int inactiveUserDays;

    // Membership expiry notifications
    @Scheduled(cron = "${notification.schedule.membership-expiry}")
    public void scheduleMembershipExpiryNotifications() {
        log.info("Running scheduled job for membership expiry notifications.");
        // Fetch users whose membership is expiring in 7, 3, 1 days and today
        for (int days : new int[]{7, 3, 1, 0}) { // 0 for "on the day"
            membershipServiceClient.getMembershipsExpiringSoon(days).forEach(membership -> {
                UserServiceClient.UserDto user = userServiceClient.getUserById(membership.userId());
                if (user != null) {
                    Map<String, String> params = new HashMap<>();
                    params.put("1", user.name()); // User's name
                    params.put("2", String.valueOf(days)); // Days until expiry
                    notificationService.sendTemplateNotification(
                            user.phoneNumber(),
                            NotificationType.MEMBERSHIP_EXPIRY,
                            params
                    );
                    log.info("Sent membership expiry notification to {} for {} days.", user.email(), days);
                }
            });
        }
    }

    // Birthday notifications
    @Scheduled(cron = "${notification.schedule.birthday-scan}")
    public void scheduleBirthdayNotifications() {
        log.info("Running scheduled job for birthday notifications.");
        userServiceClient.getUsersWithBirthdayToday(LocalDate.now()).forEach(user -> {
            Map<String, String> params = new HashMap<>();
            params.put("1", user.name());
            notificationService.sendTemplateNotification(
                    user.phoneNumber(),
                    NotificationType.BIRTHDAY_GREETING,
                    params
            );
            log.info("Sent birthday greeting to {}.", user.email());
        });
    }

    // Inactive user reminders
    @Scheduled(cron = "${notification.schedule.inactive-user-scan}")
    public void scheduleInactiveUserReminders() {
        log.info("Running scheduled job for inactive user reminders.");
        userServiceClient.getInactiveUsers(inactiveUserDays).forEach(user -> {
            Map<String, String> params = new HashMap<>();
            params.put("1", user.name());
            params.put("2", String.valueOf(inactiveUserDays));
            notificationService.sendTemplateNotification(
                    user.phoneNumber(),
                    NotificationType.INACTIVE_USER_REMINDER,
                    params
            );
            log.info("Sent inactive user reminder to {} (inactive for {} days).", user.email(), inactiveUserDays);
        });
    }

    // Daily workout reminders - This would require more complex logic to determine who needs a reminder
    // For now, it's a placeholder. A more robust solution would involve a workout service API
    // that returns users who have a workout scheduled for today.
    //@Scheduled(cron = "${notification.schedule.daily-workout-reminder}") // Define this cron in properties
    public void scheduleDailyWorkoutReminders() {
        log.info("Running scheduled job for daily workout reminders.");
        // Example: Fetch users who have a workout scheduled for today
        // userServiceClient.getUsersWithScheduledWorkoutToday().forEach(user -> {
        //     Map<String, String> params = new HashMap<>();
        //     params.put("1", user.name());
        //     params.put("2", "Your Plan Name");
        //     params.put("3", "Today's Workout");
        //     notificationService.sendTemplateNotification(
        //             user.phoneNumber(),
        //             NotificationType.DAILY_WORKOUT_REMINDER,
        //             params
        //     );
        //     log.info("Sent daily workout reminder to {}.", user.email());
        // });
    }
}
