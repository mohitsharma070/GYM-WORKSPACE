package com.gym.attendance.repository;

import com.gym.attendance.entity.Fingerprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FingerprintRepository extends JpaRepository<Fingerprint, Long> {
    Optional<Fingerprint> findByFingerprintData(String fingerprintData);
}
