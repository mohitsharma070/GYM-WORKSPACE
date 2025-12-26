package com.notificationservice.repository;

import com.notificationservice.model.WhatsAppCredential;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WhatsAppCredentialRepository extends JpaRepository<WhatsAppCredential, Long> {
    // Additional query methods if needed
}
