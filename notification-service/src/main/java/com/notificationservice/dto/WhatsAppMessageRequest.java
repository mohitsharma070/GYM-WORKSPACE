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
    private WhatsAppImageRequest image;

    public static WhatsAppMessageRequest createTextMessage(String to, String body) {
        return WhatsAppMessageRequest.builder()
                .messagingProduct("whatsapp")
                .to(to)
                .type("text")
                .text(new WhatsAppTextRequest(body))
                .build();
    }

    public static WhatsAppMessageRequest createImageMessage(String to, String imageUrl, String caption) {
        return WhatsAppMessageRequest.builder()
                .messagingProduct("whatsapp")
                .to(to)
                .type("image")
                .image(new WhatsAppImageRequest(imageUrl, caption))
                .build();
    }
}
