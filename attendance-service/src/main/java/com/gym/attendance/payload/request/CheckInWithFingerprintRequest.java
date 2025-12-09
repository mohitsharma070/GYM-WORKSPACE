package com.gym.attendance.payload.request;

import lombok.Data;

@Data
public class CheckInWithFingerprintRequest {
    private String fingerprintData;
}