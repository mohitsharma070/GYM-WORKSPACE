package com.notificationservice.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "whatsapp")
@Data
public class WhatsAppConfig {
    private String apiUrl;
    private String accessToken;
    private String phoneNumberId;
}
