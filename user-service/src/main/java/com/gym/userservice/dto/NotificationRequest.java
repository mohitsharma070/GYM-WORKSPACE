package com.gym.userservice.dto;

public class NotificationRequest {
    private String recipientId;
    private String message;
    private String type; // e.g., "EMAIL", "SMS", "IN_APP"

    public NotificationRequest() {
    }

    public NotificationRequest(String recipientId, String message, String type) {
        this.recipientId = recipientId;
        this.message = message;
        this.type = type;
    }

    // Getters and Setters
    public String getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(String recipientId) {
        this.recipientId = recipientId;
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

    @Override
    public String toString() {
        return "NotificationRequest{" +
               "recipientId='" + recipientId + "'" +
               ", message='" + message + "'" +
               ", type='" + type + "'" +
               '}';
    }
}
