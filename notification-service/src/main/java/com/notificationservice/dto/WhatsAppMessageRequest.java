package com.notificationservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WhatsAppMessageRequest {
    @JsonProperty("messaging_product")
    private String messagingProduct;
    private String to;
    private String type;
    private WhatsAppTextRequest text;
    // Add other message types like template, image, etc. as needed in the future

    public static WhatsAppMessageRequest createTextMessage(String to, String body) {
        return WhatsAppMessageRequest.builder()
                .messagingProduct("whatsapp")
                .to(to)
                .type("text")
                .text(new WhatsAppTextRequest(body))
                .build();
    }
}
