package com.notificationservice.service;

import com.notificationservice.dto.NotificationRequest;
import com.notificationservice.dto.PromotionalNotificationRequest;
import com.notificationservice.enums.TargetType;
import com.notificationservice.model.NotificationLog;
import com.notificationservice.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class WhatsAppNotificationService {

    private final NotificationLogRepository notificationLogRepository;
    private final UserServiceClient userServiceClient;

    /**
     * Sends a promotional notification based on the request.
     * This method will resolve recipients, simulate sending, and log the notification.
     *
     * @param request The promotional notification request.
     */
    public void sendPromotionalNotification(PromotionalNotificationRequest request) {
        log.info("Processing promotional notification request: {}", request);

        List<String> recipients = resolveRecipients(request.getTargetType(), request.getTargetIdentifiers());
        String status = "PENDING"; // Assume pending until actual send logic
        try {
            // Simulate sending to WhatsApp API
            log.info("Simulating sending WhatsApp message to {} recipients. Message: '{}', Image: '{}'",
                    recipients.size(), request.getMessageContent(), request.getImageUrl());

            // In a real scenario, integrate with WhatsApp API here
            // e.g., whatsappApiClient.sendMessage(recipient, request.getMessageContent(), request.getImageUrl());

            // For now, assume success
            status = "SENT";
            log.info("Notification successfully processed and sent to {} recipients.", recipients.size());

        } catch (Exception e) {
            status = "FAILED";
            log.error("Failed to send notification: {}", e.getMessage());
        } finally {
            logNotification(request, status);
        }
    }

    /**
     * Sends a transactional notification based on the request from another service.
     * This method will simulate sending and log the notification.
     *
     * @param request The transactional notification request.
     */
    public void sendTransactionalNotification(NotificationRequest request) {
        log.info("Processing transactional notification request for phone number {}: {}", request.getPhoneNumber(), request);

        String status = "PENDING";
        try {
            // Simulate sending a WhatsApp message
            log.info("Simulating sending WhatsApp message to phone number '{}'. Message: '{}'", request.getPhoneNumber(), request.getMessage());

            status = "SENT";
            log.info("Transactional notification successfully sent to {}.", request.getPhoneNumber());

        } catch (Exception e) {
            status = "FAILED";
            log.error("Failed to send transactional notification to {}: {}", request.getPhoneNumber(), e.getMessage());
        } finally {
            // Log the transactional notification
            NotificationLog logEntry = new NotificationLog();
            logEntry.setTargetType(TargetType.SPECIFIC_PHONES); // Or a new appropriate type
            logEntry.setTargetIdentifiers(request.getPhoneNumber());
            logEntry.setMessageContent(request.getMessage());
            logEntry.setStatus(status);
            logEntry.setTimestamp(LocalDateTime.now());
            notificationLogRepository.save(logEntry);
            log.info("Transactional notification logged for phone number {} with status: {}", request.getPhoneNumber(), status);
        }
    }

    /**
     * Resolves the list of recipients based on the target type and identifiers.
     * In a real application, this would involve calling other microservices.
     *
     * @param targetType The type of target audience.
     * @param targetIdentifiers Optional list of specific identifiers (e.g., phone numbers).
     * @return A list of resolved recipient identifiers (e.g., phone numbers).
     */
    private List<String> resolveRecipients(TargetType targetType, List<String> targetIdentifiers) {
        // Placeholder logic for recipient resolution
        return switch (targetType) {
            case ALL_USERS ->
                userServiceClient.getAllUserPhoneNumbers();
            case ALL_MEMBERS ->
                // Call membership-service to get all member phone numbers
                // return membershipServiceClient.getAllMemberPhoneNumbers();
                    Arrays.asList("1112223333", "4445556666"); // Dummy data
            case ALL_TRAINERS ->
                // Call trainer-service to get all trainer phone numbers
                // return trainerServiceClient.getAllTrainerPhoneNumbers();
                    Arrays.asList("7778889999", "0001112222"); // Dummy data
            case SPECIFIC_USERS ->
                userServiceClient.getPhoneNumbersByUserIds(targetIdentifiers);
            case SPECIFIC_PHONES -> targetIdentifiers != null ? targetIdentifiers : List.of();
        };
    }

    /**
     * Logs the notification details to the database.
     *
     * @param request The promotional notification request.
     * @param status The final status of the notification (e.g., "SENT", "FAILED").
     */
    private void logNotification(PromotionalNotificationRequest request, String status) {
        NotificationLog logEntry = new NotificationLog();
        logEntry.setTargetType(request.getTargetType());
        logEntry.setTargetIdentifiers(request.getTargetIdentifiers() != null ? String.join(",", request.getTargetIdentifiers()) : null);
        logEntry.setMessageContent(request.getMessageContent());
        logEntry.setImageUrl(request.getImageUrl());
        logEntry.setStatus(status);
        logEntry.setTimestamp(LocalDateTime.now());
        notificationLogRepository.save(logEntry);
        log.info("Notification logged with status: {}", status);
    }
}