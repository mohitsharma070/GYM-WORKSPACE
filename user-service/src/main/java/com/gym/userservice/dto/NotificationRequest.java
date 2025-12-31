package com.gym.userservice.dto;

public class NotificationRequest {
    private String phoneNumber;
    private String message;
    private String type; // e.g., "MEMBERSHIP_EXPIRY", "PAYMENT_CONFIRMATION"

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}