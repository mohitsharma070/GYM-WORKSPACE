package com.notificationservice.controller;

import com.notificationservice.dto.NotificationLogResponse;
import com.notificationservice.dto.PromotionalNotificationRequest;
import com.notificationservice.enums.TargetType;
import com.notificationservice.model.NotificationLog;
import com.notificationservice.repository.NotificationLogRepository;
import com.notificationservice.service.WhatsAppNotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@Slf4j
public class NotificationController {

    @Autowired
    private WhatsAppNotificationService whatsAppNotificationService;

    @Autowired
    private NotificationLogRepository notificationLogRepository; // Inject repository to fetch logs directly

    @PostMapping("/promotional-notifications")
    public ResponseEntity<String> sendPromotionalNotification(@RequestBody PromotionalNotificationRequest request) {
        log.info("Received request to send promotional notification: {}", request);
        whatsAppNotificationService.sendPromotionalNotification(request);
        return ResponseEntity.ok("Promotional notification request received and being processed.");
    }

    @PostMapping("/images/upload")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select an image file to upload.");
        }
        try {
            String imageUrl = whatsAppNotificationService.uploadImage(file);
            return ResponseEntity.ok(imageUrl);
        } catch (Exception e) {
            log.error("Error uploading image: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload image.");
        }
    }

    @GetMapping("/promotional-notifications/history")
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
}