package com.notificationservice.model;

import com.notificationservice.enums.TargetType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false)
    private TargetType targetType;

    // Storing as String, comma-separated for simplicity. Could be JSONB or a separate table for complex scenarios.
    @Column(name = "target_identifiers", columnDefinition = "TEXT") // Changed to TEXT
    private String targetIdentifiers;

    @Column(name = "message_content", columnDefinition = "TEXT")
    private String messageContent;

    @Column(name = "image_url")
    private String imageUrl; // Nullable

    @Column(name = "status", nullable = false)
    private String status; // e.g., "SENT", "FAILED", "PENDING"

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason; // Stores the reason if status is FAILED

    @Column(name = "external_message_id")
    private String externalMessageId; // Stores the ID from WhatsApp API if status is SENT

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
}
