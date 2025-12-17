package com.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WhatsAppMessageResponse {
    private List<MessageResult> messages;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageResult {
        private String id;
    }
}
