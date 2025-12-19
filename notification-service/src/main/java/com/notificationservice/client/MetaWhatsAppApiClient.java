package com.notificationservice.client;

import com.notificationservice.config.WhatsAppConfig;
import com.notificationservice.dto.WhatsAppMessageRequest;
import com.notificationservice.dto.WhatsAppMessageResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
@Slf4j
public class MetaWhatsAppApiClient {

    private final WebClient webClient;
    private final WhatsAppConfig whatsAppConfig;

    public MetaWhatsAppApiClient(WebClient.Builder webClientBuilder, WhatsAppConfig whatsAppConfig) {
        this.whatsAppConfig = whatsAppConfig;
        this.webClient = webClientBuilder.baseUrl(whatsAppConfig.getApiUrl())
                .defaultHeader("Authorization", "Bearer " + whatsAppConfig.getAccessToken())
                .build();
    }

    public Mono<WhatsAppMessageResponse> sendMessage(WhatsAppMessageRequest request) {
        String url = String.format("/%s/messages", whatsAppConfig.getPhoneNumberId());
        log.info("Sending WhatsApp message to Meta API: {}", request);
        return webClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(WhatsAppMessageResponse.class)
                .doOnError(e -> log.error("Error sending WhatsApp message: {}", e.getMessage()));
    }
}
