package com.gym.userservice.dto;

import com.gym.userservice.enums.TargetType;
import lombok.Data;
import java.util.List;

@Data
public class PromotionalNotificationRequest {
    private TargetType targetType;
    private List<String> targetIdentifiers;
    private String messageContent;
    private String imageUrl;
}
