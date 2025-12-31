package com.notificationservice.service;

import com.notificationservice.client.MetaWhatsAppApiClient;
import com.notificationservice.client.UserServiceClient;
import com.notificationservice.dto.NotificationResult;
import com.notificationservice.dto.PromotionalNotificationRequest;
import com.notificationservice.dto.WhatsAppMessageRequest;
import com.notificationservice.dto.WhatsAppMessageResponse;
import com.notificationservice.enums.TargetType;
import com.notificationservice.model.NotificationLog;
import com.notificationservice.dto.NotificationRequest; // Changed from dto.NotificationRequest
import com.notificationservice.util.TemplateLoader;
import com.notificationservice.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class WhatsAppNotificationService implements IWhatsAppNotificationService { // Implements interface

    private final NotificationLogRepository notificationLogRepository;
    private final UserServiceClient userServiceClient;
    private final MetaWhatsAppApiClient metaWhatsAppApiClient; // Injected MetaWhatsAppApiClient

    /**
     * Sends a promotional notification based on the request.
     * This method will resolve recipients, send notifications via WhatsApp API, and log the outcome.
     *
     * @param request The promotional notification request.
     * @return A list of NotificationResult for each recipient.
     */
    public List<NotificationResult> sendPromotionalNotification(PromotionalNotificationRequest request) {
        log.info("Processing promotional notification request: {}", request);

        List<String> recipients = resolveRecipients(request.getTargetType(), request.getTargetIdentifiers());
        List<NotificationResult> results = new java.util.ArrayList<>();

        if (recipients.isEmpty()) {
            results.add(NotificationResult.failure("No recipients resolved for promotional notification."));
            return results;
        }

        for (String recipientPhoneNumber : recipients) {
            NotificationRequest transactionalRequest = new NotificationRequest();
            transactionalRequest.setPhoneNumber(recipientPhoneNumber);
            transactionalRequest.setMessage(request.getMessageContent());
            transactionalRequest.setImageUrl(request.getImageUrl());
            NotificationResult result = sendNotification(transactionalRequest, false);
            results.add(result);
            logPromotionalNotificationOutcome(request, recipientPhoneNumber, result);
        }
        return results;
    }

    /**
     * Sends a transactional notification (single message) via Meta WhatsApp Business API.
     * This method implements the IWhatsAppNotificationService contract.
     *
     * @param request The transactional notification request.
     * @return NotificationResult indicating success or failure.
     */
    @Override
    public NotificationResult sendNotification(NotificationRequest request) {
        return sendNotification(request, true);
    }

    // Overloaded method to control transactional logging
    public NotificationResult sendNotification(NotificationRequest request, boolean logTransactional) {
        String phoneNumber = request.getPhoneNumber();
        String messageContent = request.getMessage();
        String imageUrl = normalizeImageUrl(request.getImageUrl());
        log.info("Attempting to send transactional WhatsApp message to {}: {} (imageUrl={})", phoneNumber, messageContent, imageUrl);

        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return NotificationResult.failure("Recipient phone number is missing.");
        }
        if ((messageContent == null || messageContent.isEmpty()) && (imageUrl == null || imageUrl.isEmpty())) {
            return NotificationResult.failure("Notification message content and image URL are both empty.");
        }

        NotificationResult result;
        try {
            WhatsAppMessageRequest whatsAppRequest;
            if (imageUrl != null && !imageUrl.isEmpty()) {
                whatsAppRequest = WhatsAppMessageRequest.createImageMessage(phoneNumber, imageUrl, messageContent);
            } else {
                whatsAppRequest = WhatsAppMessageRequest.createTextMessage(phoneNumber, messageContent);
            }
            Mono<WhatsAppMessageResponse> responseMono = metaWhatsAppApiClient.sendMessage(whatsAppRequest);
            WhatsAppMessageResponse response = responseMono.block();

            if (response != null && response.getMessages() != null && !response.getMessages().isEmpty()) {
                String externalMessageId = response.getMessages().get(0).getId();
                result = NotificationResult.success(externalMessageId);
                log.info("Transactional notification sent successfully to {}. External ID: {}", phoneNumber, externalMessageId);
            } else {
                result = NotificationResult.failure("WhatsApp API response was empty or malformed.");
                log.error("Transactional notification failed for {}: {}", phoneNumber, result.getMessage());
            }
        } catch (Exception e) {
            log.error("Failed to send transactional notification to {}: {}", phoneNumber, e.getMessage(), e);
            result = NotificationResult.failure("Exception during WhatsApp API call: " + e.getMessage());
        }
        if (logTransactional) {
            logTransactionalNotificationOutcome(request, result);
        }
        return result;
    }

    // Normalizes accidental concatenated base URLs (e.g., http://localhost:8005https://domain/file.jpg)
    private String normalizeImageUrl(String url) {
        if (url == null) return null;
        String trimmed = url.trim();
        int secondHttp = trimmed.indexOf("http", 1); // find a second http/https occurrence
        if (secondHttp > 0) {
            // If the string has two http occurrences back-to-back, keep from the second
            return trimmed.substring(secondHttp);
        }
        return trimmed;
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
     * Logs the outcome of a transactional notification to the database.
     *
     * @param request The original notification request.
     * @param result The result of the notification attempt.
     */
    private void logTransactionalNotificationOutcome(NotificationRequest request, NotificationResult result) {
        NotificationLog logEntry = new NotificationLog();
        logEntry.setTargetType(TargetType.SPECIFIC_PHONES); // Transactional are usually to specific phones
        logEntry.setTargetIdentifiers(request.getPhoneNumber());
        logEntry.setMessageContent(request.getMessage());
        logEntry.setStatus(result.isSuccess() ? "SENT" : "FAILED");
        logEntry.setFailureReason(result.isSuccess() ? null : result.getMessage());
        logEntry.setExternalMessageId(result.getExternalMessageId());
        logEntry.setTimestamp(LocalDateTime.now());
        notificationLogRepository.save(logEntry);
        log.debug("Transactional notification outcome logged for phone {}: {}", request.getPhoneNumber(), result);
    }

    /**
     * Logs the outcome of a promotional notification for a single recipient.
     *
     * @param promoRequest The original promotional notification request.
     * @param recipientPhoneNumber The phone number of the recipient.
     * @param result The result of the notification attempt for this recipient.
     */
    private void logPromotionalNotificationOutcome(PromotionalNotificationRequest promoRequest, String recipientPhoneNumber, NotificationResult result) {
        NotificationLog logEntry = new NotificationLog();
        logEntry.setTargetType(promoRequest.getTargetType());
        logEntry.setTargetIdentifiers(recipientPhoneNumber); // Log for each individual recipient
        logEntry.setMessageContent(promoRequest.getMessageContent());
        logEntry.setImageUrl(promoRequest.getImageUrl());
        logEntry.setStatus(result.isSuccess() ? "SENT" : "FAILED");
        logEntry.setFailureReason(result.isSuccess() ? null : result.getMessage());
        logEntry.setExternalMessageId(result.getExternalMessageId());
        logEntry.setTimestamp(LocalDateTime.now());
        notificationLogRepository.save(logEntry);
        log.debug("Promotional notification outcome logged for recipient {}: {}", recipientPhoneNumber, result);
    }
}