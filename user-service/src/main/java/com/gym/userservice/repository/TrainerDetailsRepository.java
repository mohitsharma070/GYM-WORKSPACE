package com.gym.userservice.repository;

import com.gym.userservice.entity.TrainerDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TrainerDetailsRepository extends JpaRepository<TrainerDetails, Long> {

    // Fetch only active trainer details (deleted = false)
    @Query("""
        SELECT t FROM TrainerDetails t
        WHERE t.deleted = false
    """)
    List<TrainerDetails> findAllActive();
}
