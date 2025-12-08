package com.gym.attendance.service;

import com.gym.attendance.entity.Fingerprint;
import java.util.Optional;

public interface FingerprintService {
    Fingerprint registerFingerprint(Long userId, String fingerprintData);
    Optional<Long> verifyFingerprint(String fingerprintData);
}