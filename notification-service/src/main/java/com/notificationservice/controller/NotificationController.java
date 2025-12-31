
package com.notificationservice.controller;

import com.notificationservice.dto.NotificationRequest;
import com.notificationservice.dto.NotificationLogResponse;
import com.notificationservice.dto.NotificationResult;
import com.notificationservice.dto.PromotionalNotificationRequest;
import com.notificationservice.enums.TargetType;
import com.notificationservice.model.NotificationLog;
import com.notificationservice.repository.NotificationLogRepository;
import com.notificationservice.service.IWhatsAppNotificationService; // Changed to interface
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class NotificationController {

    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);

    private final IWhatsAppNotificationService whatsAppNotificationService;
    private final NotificationLogRepository notificationLogRepository;

        /**
         * Global stats for notification logs (all pages, not paginated)
         */
        @GetMapping("/promotional-notifications/stats")
        public ResponseEntity<?> getNotificationStats(
            @RequestParam(required = false) TargetType targetType) {
        // Count all logs (optionally filtered by targetType)
        long total = (targetType == null)
            ? notificationLogRepository.count()
            : notificationLogRepository.countByTargetType(targetType);

        // Count by status
        long sent = (targetType == null)
            ? notificationLogRepository.countByStatus("SENT")
            : notificationLogRepository.countByTargetTypeAndStatus(targetType, "SENT");
        long failed = (targetType == null)
            ? notificationLogRepository.countByStatus("FAILED")
            : notificationLogRepository.countByTargetTypeAndStatus(targetType, "FAILED");
        long pending = (targetType == null)
            ? notificationLogRepository.countByStatus("PENDING")
            : notificationLogRepository.countByTargetTypeAndStatus(targetType, "PENDING");

        return ResponseEntity.ok(Map.of(
            "total", total,
            "sent", sent,
            "failed", failed,
            "pending", pending
        ));
        }
    @PostMapping("/notifications/send")
    public ResponseEntity<String> sendTransactionalNotification(@RequestBody NotificationRequest request) {
        log.info("Received request to send transactional notification: {}", request);
        NotificationResult result = whatsAppNotificationService.sendNotification(request);
        if (result.isSuccess()) {
            return ResponseEntity.ok("Transactional notification request processed successfully. Message ID: " + (result.getExternalMessageId() != null ? result.getExternalMessageId() : "N/A"));
        } else {
            return ResponseEntity.badRequest().body("Transactional notification failed: " + (result.getMessage() != null ? result.getMessage() : "Unknown error"));
        }
    }

    @PostMapping("/promotional-notifications")
    public ResponseEntity<String> sendPromotionalNotification(@RequestBody PromotionalNotificationRequest request) {
        log.info("Received request to send promotional notification: {}", request);
        // Normalize image URL to avoid accidental double prefixes from clients/gateways
        if (request.getImageUrl() != null) {
            request.setImageUrl(normalizeImageUrl(request.getImageUrl()));
        }
        List<NotificationResult> results = whatsAppNotificationService.sendPromotionalNotification(request);
        long successCount = results.stream().filter(NotificationResult::isSuccess).count();
        long failureCount = results.size() - successCount;

        String responseMessage = String.format("Promotional notification request processed. Total: %d, Sent: %d, Failed: %d.",
            results.size(), successCount, failureCount);

        if (failureCount > 0) {
            String failureReasons = results.stream()
                .filter(r -> !r.isSuccess())
                .map(NotificationResult::getMessage)
                .filter(msg -> msg != null)
                .collect(Collectors.joining("; "));
            responseMessage += " Failures: " + failureReasons;
            return ResponseEntity.status(207).body(responseMessage); // Multi-Status
        } else {
            return ResponseEntity.ok(responseMessage);
        }
    }

    @GetMapping("/promotional-notifications/logs")
    public ResponseEntity<Page<NotificationLogResponse>> getNotificationHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction sortDirection,
            @RequestParam(required = false) TargetType targetType,
            @RequestParam(required = false) String status) {
        log.info("Fetching notification history: page={}, size={}, sortBy={}, sortDirection={}, targetType={}, status={}",
                page, size, sortBy, sortDirection, targetType, status);

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<NotificationLog> notificationLogs;

        if (targetType != null && status != null) {
            notificationLogs = notificationLogRepository.findByTargetTypeAndStatus(targetType, status, pageable);
        } else if (targetType != null) {
            notificationLogs = notificationLogRepository.findByTargetType(targetType, pageable);
        } else if (status != null) {
            notificationLogs = notificationLogRepository.findByStatus(status, pageable);
        } else {
            notificationLogs = notificationLogRepository.findAll(pageable);
        }

        Page<NotificationLogResponse> responsePage = notificationLogs.map(NotificationLogResponse::fromEntity);
        return ResponseEntity.ok(responsePage);
    }

    private String normalizeImageUrl(String url) {
        String trimmed = url.trim();
        int secondHttp = trimmed.indexOf("http", 1);
        if (secondHttp > 0) {
            return trimmed.substring(secondHttp);
        }
        return trimmed;
    }
}