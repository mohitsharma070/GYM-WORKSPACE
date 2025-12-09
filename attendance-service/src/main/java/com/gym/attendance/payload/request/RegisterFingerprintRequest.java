package com.gym.attendance.payload.request;

import lombok.Data;

@Data
public class RegisterFingerprintRequest {
    private Long userId;
    private String fingerprintData;
}