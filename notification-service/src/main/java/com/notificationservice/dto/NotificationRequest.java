package com.notificationservice.dto;

import lombok.Data;

@Data
public class NotificationRequest {
    private String phoneNumber;
    private String message;
    private String type; // e.g., "MEMBERSHIP_EXPIRY", "PAYMENT_CONFIRMATION"
    private String imageUrl; // Optional: public URL of the image to send
}
