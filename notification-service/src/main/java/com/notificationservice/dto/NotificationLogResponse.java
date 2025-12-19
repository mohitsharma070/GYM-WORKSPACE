package com.notificationservice.dto;

import com.notificationservice.enums.TargetType;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Arrays;
import java.util.stream.Collectors;

@Data
public class NotificationLogResponse {
    private Long id;
    private TargetType targetType;
    private List<String> targetIdentifiers;
    private String messageContent;
    private String imageUrl;
    private String status;
    private LocalDateTime timestamp;

    // Helper to convert NotificationLog to NotificationLogResponse
    public static NotificationLogResponse fromEntity(com.notificationservice.model.NotificationLog entity) {
        NotificationLogResponse dto = new NotificationLogResponse();
        dto.setId(entity.getId());
        dto.setTargetType(entity.getTargetType());
        dto.setTargetIdentifiers(
                entity.getTargetIdentifiers() != null && !entity.getTargetIdentifiers().isEmpty() ?
                        Arrays.asList(entity.getTargetIdentifiers().split(",")) : List.of()
        );
        dto.setMessageContent(entity.getMessageContent());
        dto.setImageUrl(entity.getImageUrl());
        dto.setStatus(entity.getStatus());
        dto.setTimestamp(entity.getTimestamp());
        return dto;
    }
}
