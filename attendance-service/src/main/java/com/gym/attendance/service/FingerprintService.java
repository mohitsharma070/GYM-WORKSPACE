package com.gym.attendance.service;

import com.gym.attendance.entity.Fingerprint;
import com.gym.attendance.repository.FingerprintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class FingerprintService {

    private final FingerprintRepository fingerprintRepository;

    @Autowired
    public FingerprintService(FingerprintRepository fingerprintRepository) {
        this.fingerprintRepository = fingerprintRepository;
    }

    public Fingerprint registerFingerprint(Long userId, String fingerprintData) {
        // In a real-world scenario, you might want to check if a user already has a fingerprint registered
        // or if this fingerprint data is already associated with another user.
        // For simplicity, we'll assume unique fingerprintData per user for now.
        Fingerprint fingerprint = new Fingerprint();
        fingerprint.setUserId(userId);
        fingerprint.setFingerprintData(fingerprintData);
        return fingerprintRepository.save(fingerprint);
    }

    public Optional<Long> verifyFingerprint(String fingerprintData) {
        return fingerprintRepository.findByFingerprintData(fingerprintData)
                .map(Fingerprint::getUserId);
    }
}
