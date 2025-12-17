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

    public void setTargetType(TargetType targetType) {
        this.targetType = targetType;
    }

    public void setMessageContent(String messageContent) {
        this.messageContent = messageContent;
    }

    public void setTargetIdentifiers(List<String> targetIdentifiers) {
        this.targetIdentifiers = targetIdentifiers;
    }
}
