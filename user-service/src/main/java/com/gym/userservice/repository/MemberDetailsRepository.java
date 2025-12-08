package com.gym.userservice.repository;

import com.gym.userservice.entity.MemberDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MemberDetailsRepository extends JpaRepository<MemberDetails, Long> {

    // Return only active (non-deleted) member details
    @Query("""
        SELECT m FROM MemberDetails m
        WHERE m.deleted = false
    """)
    List<MemberDetails> findAllActive();
}
