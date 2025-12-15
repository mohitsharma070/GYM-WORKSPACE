package com.notificationservice.service;

import com.notificationservice.dto.PromotionalNotificationRequest;
import com.notificationservice.enums.TargetType;
import com.notificationservice.model.NotificationLog;
import com.notificationservice.repository.NotificationLogRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class WhatsAppNotificationService {

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    // Placeholder for user/member/trainer service client
    // In a real application, these would be Feign Clients or similar to call other microservices
    // private UserServiceClient userServiceClient;
    // private MembershipServiceClient membershipServiceClient;
    // private TrainerServiceClient trainerServiceClient;

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
     * Resolves the list of recipients based on the target type and identifiers.
     * In a real application, this would involve calling other microservices.
     *
     * @param targetType The type of target audience.
     * @param targetIdentifiers Optional list of specific identifiers (e.g., phone numbers).
     * @return A list of resolved recipient identifiers (e.g., phone numbers).
     */
    private List<String> resolveRecipients(TargetType targetType, List<String> targetIdentifiers) {
        // Placeholder logic for recipient resolution
        switch (targetType) {
            case ALL_USERS:
                // Call user-service to get all user phone numbers
                // return userServiceClient.getAllUserPhoneNumbers();
                return Arrays.asList("1234567890", "0987654321"); // Dummy data
            case ALL_MEMBERS:
                // Call membership-service to get all member phone numbers
                // return membershipServiceClient.getAllMemberPhoneNumbers();
                return Arrays.asList("1112223333", "4445556666"); // Dummy data
            case ALL_TRAINERS:
                // Call trainer-service to get all trainer phone numbers
                // return trainerServiceClient.getAllTrainerPhoneNumbers();
                return Arrays.asList("7778889999", "0001112222"); // Dummy data
            case SPECIFIC_PHONES:
                return targetIdentifiers != null ? targetIdentifiers : List.of();
            default:
                return List.of();
        }
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

    /**
     * Placeholder method for image upload.
     * In a real application, this would upload to AWS S3, Azure Blob Storage, etc.
     *
     * @param file The image file to upload.
     * @return A public URL to the uploaded image.
     */
    public String uploadImage(MultipartFile file) {
        log.info("Simulating image upload for file: {}", file.getOriginalFilename());
        // In a real application:
        // 1. Store file to cloud storage (S3, Azure Blob, Google Cloud Storage)
        // 2. Generate a unique file name/path
        // 3. Return the public URL

        // For now, return a dummy URL
        return "https://example.com/images/" + UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
    }
}