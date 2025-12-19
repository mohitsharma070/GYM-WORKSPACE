package com.notificationservice.model;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
public class PromotionalNotificationRequest {
    @NotBlank(message = "Message cannot be empty")
    private String message;

    @NotNull(message = "Target type cannot be null")
    private TargetType targetType;

    // Required only if targetType is SPECIFIC_PHONES
    private List<String> targetIdentifiers; // Phone numbers for SPECIFIC_PHONES, or null otherwise

    private String imageUrl; // Optional: URL of an image to send with the message
}