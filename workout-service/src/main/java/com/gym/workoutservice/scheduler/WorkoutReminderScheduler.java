package com.gym.workoutservice.scheduler;

import com.gym.workoutservice.client.NotificationClient;
import com.gym.workoutservice.client.UserClient;
import com.gym.workoutservice.dto.NotificationRequest;
import com.gym.workoutservice.entity.AssignedWorkoutPlan;
import com.gym.workoutservice.entity.WorkoutDay;
import com.gym.workoutservice.repository.AssignedWorkoutPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class WorkoutReminderScheduler {

    private final AssignedWorkoutPlanRepository assignedWorkoutPlanRepository;
    private final UserClient userClient;
    private final NotificationClient notificationClient;

    @Scheduled(cron = "0 0 8 * * *") // Runs every day at 8 AM
    public void sendWorkoutReminders() {
        LocalDate today = LocalDate.now();
        DayOfWeek dayOfWeek = today.getDayOfWeek();
        int dayNumber = dayOfWeek.getValue(); // 1 for Monday, 7 for Sunday

        List<AssignedWorkoutPlan> activePlans = assignedWorkoutPlanRepository.findActivePlansForDate(today);

        for (AssignedWorkoutPlan plan : activePlans) {
            for (WorkoutDay workoutDay : plan.getWorkoutPlan().getWorkoutDays()) {
                if (workoutDay.getDayNumber() == dayNumber) {
                    // This user has a workout scheduled for today
                    sendReminder(plan.getMemberId(), workoutDay);
                    break; // Move to the next plan
                }
            }
        }
    }

    private void sendReminder(Long userId, WorkoutDay workoutDay) {
        try {
            UserClient.UserResponse user = userClient.getUserById(userId);
            NotificationRequest notification = new NotificationRequest();
            notification.setPhoneNumber(user.phone); // Replace with phone if available
            notification.setType("DAILY_WORKOUT_REMINDER");
            java.util.Map<String, String> values = new java.util.HashMap<>();
            values.put("userName", user.name);
            values.put("dayName", java.time.DayOfWeek.of(workoutDay.getDayNumber()).toString());
            String rendered = com.gym.workoutservice.util.TemplateLoader.renderTemplate(
                "daily_workout_reminder.html", values);
            if (rendered.isEmpty()) {
                rendered = "Hi " + user.name + ", just a reminder that you have a workout scheduled for today (" + java.time.DayOfWeek.of(workoutDay.getDayNumber()) + "). Let's do this!";
            }
            notification.setMessage(rendered);
            notificationClient.sendNotification(notification);
        } catch (Exception e) {
            System.err.println("Failed to send workout reminder for user " + userId + ": " + e.getMessage());
        }
    }
}
