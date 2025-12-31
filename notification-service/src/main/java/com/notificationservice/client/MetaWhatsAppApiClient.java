package com.notificationservice.client;

import com.notificationservice.repository.WhatsAppCredentialRepository;
import com.notificationservice.model.WhatsAppCredential;
import com.notificationservice.dto.WhatsAppMessageRequest;
import com.notificationservice.dto.WhatsAppMessageResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
@Slf4j
public class MetaWhatsAppApiClient {

    private final WebClient.Builder webClientBuilder;
    private final WhatsAppCredentialRepository credentialRepository;

    public MetaWhatsAppApiClient(WebClient.Builder webClientBuilder, WhatsAppCredentialRepository credentialRepository) {
        this.webClientBuilder = webClientBuilder;
        this.credentialRepository = credentialRepository;
    }

    public Mono<WhatsAppMessageResponse> sendMessage(WhatsAppMessageRequest request) {
        // Always fetch the latest credential (assume only one row exists)
        WhatsAppCredential credential = credentialRepository.findAll().stream().findFirst().orElse(null);
        if (credential == null) {
            throw new IllegalStateException("No WhatsApp credentials found in the database.");
        }
        String url = String.format("/%s/messages", credential.getPhoneNumberId());
        log.info("Full WhatsApp API URL: {}{}", credential.getApiUrl(), url);
        log.info("Sending WhatsApp message to Meta API: {}", request);
        WebClient webClient = webClientBuilder.baseUrl(credential.getApiUrl())
            .defaultHeader("Authorization", "Bearer " + credential.getAccessToken())
            .build();
        return webClient.post()
            .uri(url)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchangeToMono(response -> handleResponse(response));
    }

    private Mono<WhatsAppMessageResponse> handleResponse(ClientResponse response) {
        if (response.statusCode().is2xxSuccessful()) {
            return response.bodyToMono(WhatsAppMessageResponse.class);
        }

        // Capture error body for better diagnostics (Meta returns structured JSON)
        return response.bodyToMono(String.class)
            .defaultIfEmpty("<empty body>")
            .flatMap(body -> {
                log.error("WhatsApp API error: status={} body={} ", response.statusCode(), body);
                return Mono.error(new IllegalStateException("WhatsApp API error: " + response.statusCode() + " body: " + body));
            });
    }
}
