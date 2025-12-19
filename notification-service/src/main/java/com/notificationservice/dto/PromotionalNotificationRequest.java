package com.notificationservice.dto;

import com.notificationservice.enums.TargetType;
import lombok.Data;

import java.util.List;

@Data
public class PromotionalNotificationRequest {
    private TargetType targetType;
    private List<String> targetIdentifiers; // Used for SPECIFIC_PHONES, can be empty for other types
    private String messageContent;
    private String imageUrl; // Optional, public URL of the image
}
