package com.notificationservice.controller;

import com.notificationservice.config.WhatsAppConfig;
import com.notificationservice.dto.WhatsAppCredentialsDto;
import com.notificationservice.model.WhatsAppCredential;
import com.notificationservice.repository.WhatsAppCredentialRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/whatsapp")
@RequiredArgsConstructor
@Slf4j
public class WhatsAppConfigController {
    private final WhatsAppConfig whatsAppConfig;
    private final WhatsAppCredentialRepository whatsAppCredentialRepository;

    @PostMapping("/credentials")
    public ResponseEntity<String> updateCredentials(@RequestBody WhatsAppCredentialsDto dto) {
        log.info("Received phoneNumberId: {}", dto.getPhoneNumberId());
        whatsAppConfig.setApiUrl(dto.getApiUrl());
        whatsAppConfig.setAccessToken(dto.getAccessToken());
        whatsAppConfig.setPhoneNumberId(dto.getPhoneNumberId());

        // Always update or insert the credential with id=1
        WhatsAppCredential credential = whatsAppCredentialRepository.findById(1L).orElse(new WhatsAppCredential());
        credential.setId(1L);
        credential.setPhoneNumberId(dto.getPhoneNumberId());
        credential.setApiUrl(dto.getApiUrl());
        credential.setAccessToken(dto.getAccessToken());
        whatsAppCredentialRepository.save(credential);

        return ResponseEntity.ok("WhatsApp credentials updated and saved to DB successfully.");
    }
}
