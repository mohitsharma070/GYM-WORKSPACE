package com.gym.userservice.scheduler;

import com.gym.userservice.dto.PromotionalNotificationRequest;
import com.gym.userservice.entity.User;
import com.gym.userservice.enums.TargetType;
import com.gym.userservice.feign.NotificationServiceClient;
import com.gym.userservice.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class BirthdayGreetingScheduler {

    private final UserRepository userRepository;
    private final NotificationServiceClient notificationClient;

    public BirthdayGreetingScheduler(UserRepository userRepository, NotificationServiceClient notificationClient) {
        this.userRepository = userRepository;
        this.notificationClient = notificationClient;
    }

    @Scheduled(cron = "0 0 9 * * *") // Runs every day at 9 AM
    public void sendBirthdayGreetings() {
        LocalDate today = LocalDate.now();
        int month = today.getMonthValue();
        int day = today.getDayOfMonth();

        List<User> birthdayUsers = userRepository.findByMonthAndDayOfBirth(month, day);

        for (User user : birthdayUsers) {
            sendGreeting(user);
        }
    }

    private void sendGreeting(User user) {
        String phone = null;

        // Check if the user is a member and has details
        if (user.getMemberDetails() != null) {
            phone = user.getMemberDetails().getPhone();
        }
        // If not a member, check if they are a trainer and have details
        else if (user.getTrainerDetails() != null) {
            phone = user.getTrainerDetails().getPhone();
        }

        // Only proceed if a non-empty phone number was found
        if (phone != null && !phone.isBlank()) {
            try {
                PromotionalNotificationRequest notification = new PromotionalNotificationRequest();
                notification.setTargetType(TargetType.SPECIFIC_PHONES);
                notification.setTargetIdentifiers(List.of(phone));
                // Use template loader for birthday greeting notification
                String rendered = com.gym.userservice.common.TemplateUtil.renderTemplate(
                    "birthday_greeting_notification.html",
                    java.util.Map.of("userName", user.getName() == null ? "" : user.getName())
                );
                if (rendered.isEmpty()) {
                    rendered = "Happy Birthday, " + user.getName() + "! We wish you a fantastic day from your gym!";
                }
                notification.setMessageContent(rendered);

                notificationClient.sendNotification(notification);
            } catch (Exception e) {
                System.err.println("Failed to send birthday greeting for user " + user.getId() + ": " + e.getMessage());
            }
        } else {
            System.err.println("Skipping birthday greeting for user " + user.getId() + " because no phone number is available.");
        }
    }
}
