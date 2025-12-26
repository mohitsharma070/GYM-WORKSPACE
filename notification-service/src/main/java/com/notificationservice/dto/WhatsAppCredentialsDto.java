package com.notificationservice.dto;

public class WhatsAppCredentialsDto {
    private String apiUrl;
    private String accessToken;
    private String phoneNumberId;

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