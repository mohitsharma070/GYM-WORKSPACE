package com.notificationservice.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;
import com.notificationservice.repository.WhatsAppCredentialRepository;
import com.notificationservice.model.WhatsAppCredential;

@Configuration
public class WhatsAppConfig {
    private String apiUrl;
    private String accessToken;
    private String phoneNumberId;

    @Autowired
    private WhatsAppCredentialRepository whatsAppCredentialRepository;

    @PostConstruct
    public void loadCredentialsFromDb() {
        // Load the first credential (or by some logic)
        whatsAppCredentialRepository.findAll().stream().findFirst().ifPresent(credential -> {
            this.apiUrl = credential.getApiUrl();
            this.accessToken = credential.getAccessToken();
            this.phoneNumberId = credential.getPhoneNumberId();
        });
    }

    public String getApiUrl() {
        return apiUrl;
    }
    public void setApiUrl(String apiUrl) {
        this.apiUrl = apiUrl;
    }
    public String getAccessToken() {
        return accessToken;
    }
    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
    public String getPhoneNumberId() {
        return phoneNumberId;
    }
    public void setPhoneNumberId(String phoneNumberId) {
        this.phoneNumberId = phoneNumberId;
    }
}
