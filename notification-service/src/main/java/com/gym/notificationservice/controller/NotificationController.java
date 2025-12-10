package com.gym.notificationservice.controller;

import com.gym.notificationservice.dto.*;
import com.gym.notificationservice.entity.MessageLog;
import com.gym.notificationservice.entity.NotificationTemplate.NotificationType;
import com.gym.notificationservice.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
// ... other imports ...

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notification Controller", description = "APIs for sending various types of WhatsApp notifications.")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Value("${whatsapp.api.verify-token}")
    private String whatsappVerifyToken;


    @Operation(summary = "Send a generic template-based notification",
               description = "Allows sending any template-based notification by specifying its type and parameters.",
               responses = {
                       @ApiResponse(responseCode = "200", description = "Notification sent successfully"),
                       @ApiResponse(responseCode = "400", description = "Invalid request or template not found"),
                       @ApiResponse(responseCode = "500", description = "Internal server error")
               })
    @PostMapping("/send-template")
    public ResponseEntity<MessageLog> sendGenericTemplateNotification(@Valid @RequestBody NotificationRequest request) {
        MessageLog messageLog = notificationService.sendTemplateNotification(
                request.getRecipientPhoneNumber(),
                request.getNotificationType(),
                request.getTemplateParams() != null ? request.getTemplateParams() : Map.of()
        );
        return ResponseEntity.ok(messageLog);
    }

    @Operation(summary = "Send membership expiry notification",
               description = "Triggers a notification for upcoming membership expiry.",
               responses = {
                       @ApiResponse(responseCode = "200", description = "Notification sent successfully")
               })
    @PostMapping("/membership-expiry")
    public ResponseEntity<MessageLog> sendMembershipExpiryNotification(@Valid @RequestBody MembershipExpiryNotificationRequest request) {
        MessageLog messageLog = notificationService.sendMembershipExpiryNotification(
                request.getRecipientPhoneNumber(),
                request.getDaysUntilExpiry()
        );
        return ResponseEntity.ok(messageLog);
    }

    @Operation(summary = "Send payment success notification",
               description = "Triggers a notification confirming a successful payment.",
               responses = {
                       @ApiResponse(responseCode = "200", description = "Notification sent successfully")
               })
    @PostMapping("/payment-success")
    public ResponseEntity<MessageLog> sendPaymentSuccessNotification(@Valid @RequestBody PaymentSuccessNotificationRequest request) {
        MessageLog messageLog = notificationService.sendPaymentSuccessNotification(
                request.getRecipientPhoneNumber(),
                request.getUserName(),
                request.getAmount(),
                request.getMembershipType()
        );
        return ResponseEntity.ok(messageLog);
    }

    @Operation(summary = "Send membership renewal confirmation notification",
            description = "Triggers a notification confirming a successful membership renewal.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Notification sent successfully")
            })
    @PostMapping("/membership-renewal")
    public ResponseEntity<MessageLog> sendMembershipRenewalConfirmation(@Valid @RequestBody PaymentSuccessNotificationRequest request) {
        // Reusing PaymentSuccessNotificationRequest as it has similar fields for now.
        // A dedicated DTO might be better if fields diverge.
        MessageLog messageLog = notificationService.sendMembershipRenewalConfirmation(
                request.getRecipientPhoneNumber(),
                request.getUserName(),
                request.getMembershipType(),
                "N/A" // Renewal date is not in this DTO, assuming N/A or will be fetched from other service
        );
        return ResponseEntity.ok(messageLog);
    }


    @Operation(summary = "Send check-in confirmation notification",
               description = "Triggers a notification confirming user check-in.",
               responses = {
                       @ApiResponse(responseCode = "200", description = "Notification sent successfully")
               })
    @PostMapping("/check-in")
    public ResponseEntity<MessageLog> sendCheckInConfirmation(@Valid @RequestBody CheckInNotificationRequest request) {
        MessageLog messageLog = notificationService.sendCheckInConfirmation(
                request.getRecipientPhoneNumber(),
                request.getUserName(),
                request.getCheckInTime()
        );
        return ResponseEntity.ok(messageLog);
    }

    @Operation(summary = "Send check-out confirmation notification",
               description = "Triggers a notification confirming user check-out.",
               responses = {
                       @ApiResponse(responseCode = "200", description = "Notification sent successfully")
               })
    @PostMapping("/check-out")
    public ResponseEntity<MessageLog> sendCheckOutConfirmation(@Valid @RequestBody CheckOutNotificationRequest request) {
        MessageLog messageLog = notificationService.sendCheckOutConfirmation(
                request.getRecipientPhoneNumber(),
                request.getUserName(),
                request.getCheckOutTime()
        );
        return ResponseEntity.ok(messageLog);
    }

    @Operation(summary = "Send inactive user reminder notification",
               description = "Triggers a notification reminding inactive users.",
               responses = {
                       @ApiResponse(responseCode = "200", description = "Notification sent successfully")
               })
    @PostMapping("/inactive-user-reminder")
    public ResponseEntity<MessageLog> sendInactiveUserReminder(@Valid @RequestBody InactiveUserReminderRequest request) {
        MessageLog messageLog = notificationService.sendInactiveUserReminder(
                request.getRecipientPhoneNumber(),
                request.getUserName(),
                request.getDaysInactive()
        );
        return ResponseEntity.ok(messageLog);
    }

    @Operation(summary = "Send monthly attendance summary notification",
               description = "Triggers a notification with monthly attendance summary.",
               responses = {
                       @ApiResponse(responseCode = "200", description = "Notification sent successfully")
               })
    @PostMapping("/monthly-attendance-summary")
    public ResponseEntity<MessageLog> sendMonthlyAttendanceSummary(@Valid @RequestBody MonthlyAttendanceSummaryRequest request) {
        MessageLog messageLog = notificationService.sendMonthlyAttendanceSummary(
                request.getRecipientPhoneNumber(),
                request.getUserName(),
                request.getTotalCheckIns(),
                request.getMonthYear()
        );
        return ResponseEntity.ok(messageLog);
    }

    @Operation(summary = "Send workout plan assigned notification",
               description = "Triggers a notification when a new workout plan is assigned.",
               responses = {
                       @ApiResponse(responseCode = "200", description = "Notification sent successfully")
               })
    @PostMapping("/workout-plan-assigned")
    public ResponseEntity<MessageLog> sendWorkoutPlanAssigned(@Valid @RequestBody WorkoutPlanNotificationRequest request) {
        MessageLog messageLog = notificationService.sendWorkoutPlanAssigned(
                request.getRecipientPhoneNumber(),
                request.getMemberName(),
                request.getTrainerName(),
                request.getPlanName()
        );
        return ResponseEntity.ok(messageLog);
    }

    @Operation(summary = "Send workout plan updated notification",
               description = "Triggers a notification when a workout plan is updated.",
               responses = {
                       @ApiResponse(responseCode = "200", description = "Notification sent successfully")
               })
    @PostMapping("/workout-plan-updated")
    public ResponseEntity<MessageLog> sendWorkoutPlanUpdated(@Valid @RequestBody WorkoutPlanNotificationRequest request) {
        MessageLog messageLog = notificationService.sendWorkoutPlanUpdated(
                request.getRecipientPhoneNumber(),
                request.getMemberName(),
                request.getTrainerName(),
                request.getPlanName()
        );
        return ResponseEntity.ok(messageLog);
    }

    @Operation(summary = "Send daily workout reminder notification",
               description = "Triggers a notification for daily workout reminder.",
               responses = {
                       @ApiResponse(responseCode = "200", description = "Notification sent successfully")
               })
    @PostMapping("/daily-workout-reminder")
    public ResponseEntity<MessageLog> sendDailyWorkoutReminder(@Valid @RequestBody DailyWorkoutReminderRequest request) {
        MessageLog messageLog = notificationService.sendDailyWorkoutReminder(
                request.getRecipientPhoneNumber(),
                request.getUserName(),
                request.getPlanName(),
                request.getWorkoutDay()
        );
        return ResponseEntity.ok(messageLog);
    }

    @Operation(summary = "Send birthday greeting notification",
               description = "Triggers a personalized birthday greeting notification.",
               responses = {
                       @ApiResponse(responseCode = "200", description = "Notification sent successfully")
               })
    @PostMapping("/birthday-greeting")
    public ResponseEntity<MessageLog> sendBirthdayGreeting(@Valid @RequestBody BirthdayGreetingNotificationRequest request) {
        MessageLog messageLog = notificationService.sendBirthdayGreeting(
                request.getRecipientPhoneNumber(),
                request.getUserName()
        );
        return ResponseEntity.ok(messageLog);
    }

    @Operation(summary = "Send promotional/bulk message notification",
               description = "Triggers a promotional or bulk message notification. Requires Admin privileges.",
               responses = {
                       @ApiResponse(responseCode = "200", description = "Notification sent successfully")
               })
    @PostMapping("/promotional")
    public ResponseEntity<MessageLog> sendPromotionalMessage(@Valid @RequestBody PromotionalNotificationRequest request) {
        // Authorization check for admin can be added here or via Spring Security
        MessageLog messageLog = notificationService.sendPromotionalMessage(
                request.getRecipientPhoneNumber(),
                request.getMessageBody()
        );
        return ResponseEntity.ok(messageLog);
    }

    @Operation(summary = "Send trainer new member assigned notification",
               description = "Triggers a notification to a trainer when a new member is assigned.",
               responses = {
                       @ApiResponse(responseCode = "200", description = "Notification sent successfully")
               })
    @PostMapping("/trainer-new-member-assigned")
    public ResponseEntity<MessageLog> sendTrainerNewMemberNotification(@Valid @RequestBody TrainerAssignmentNotificationRequest request) {
        MessageLog messageLog = notificationService.sendTrainerNewMemberNotification(
                request.getRecipientPhoneNumber(),
                request.getTrainerName(),
                request.getMemberName()
        );
        return ResponseEntity.ok(messageLog);
    }

    @Operation(summary = "Send trainer workout plan completed notification",
               description = "Triggers a notification to a trainer when a member completes a workout plan.",
               responses = {
                       @ApiResponse(responseCode = "200", description = "Notification sent successfully")
               })
    @PostMapping("/trainer-workout-completed")
    public ResponseEntity<MessageLog> sendTrainerWorkoutPlanCompletedNotification(@Valid @RequestBody TrainerAssignmentNotificationRequest request) {
        MessageLog messageLog = notificationService.sendTrainerWorkoutPlanCompletedNotification(
                request.getRecipientPhoneNumber(),
                request.getTrainerName(),
                request.getMemberName(),
                request.getPlanName()
        );
        return ResponseEntity.ok(messageLog);
    }

    // Webhook for WhatsApp status updates
    @PostMapping("/whatsapp-webhook")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Receive WhatsApp webhook updates",
               description = "Endpoint for WhatsApp Cloud API to send message status updates. Do not call directly.",
               responses = {
                       @ApiResponse(responseCode = "200", description = "Webhook received successfully")
               })
    public void handleWhatsAppWebhook(@RequestBody String payload) {
        // This is a placeholder. A dedicated webhook handler service would parse the payload
        // and update message statuses using notificationService.updateMessageStatus()
        // For now, we just log it.
        // In a production scenario, you would parse the JSON payload from WhatsApp
        // and extract message IDs and statuses.
        // For example:
        // if (payload.contains("\"status\":\"delivered\"")) {
        //     String messageId = extractMessageId(payload);
        //     notificationService.updateMessageStatus(messageId, MessageLog.MessageStatus.DELIVERED, null);
        // }
        // For the sake of this exercise, we'll assume a simpler parsing or delegate to another service.
        System.out.println("Received WhatsApp webhook payload: " + payload);
    }

    // Webhook verification endpoint (GET request from WhatsApp)
    @GetMapping("/whatsapp-webhook")
    @Operation(summary = "Verify WhatsApp webhook",
               description = "Endpoint for WhatsApp Cloud API webhook verification. Do not call directly.",
               responses = {
                       @ApiResponse(responseCode = "200", description = "Webhook verified successfully")
               })
        public ResponseEntity<String> verifyWhatsAppWebhook(@RequestParam("hub.mode") String mode,
                                                            @RequestParam("hub.challenge") String challenge,
                                                            @RequestParam("hub.verify_token") String verifyToken) {
            if ("subscribe".equals(mode) && whatsappVerifyToken.equals(verifyToken)) {
                System.out.println("Webhook verified successfully!");
                return ResponseEntity.ok(challenge);
            } else {
                System.err.println("Webhook verification failed. Mode: " + mode + ", Verify Token: " + verifyToken);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Verification failed");
            }
        }

}
