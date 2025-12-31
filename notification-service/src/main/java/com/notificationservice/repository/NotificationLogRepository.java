package com.notificationservice.repository;

import com.notificationservice.model.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.notificationservice.enums.TargetType;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    Page<NotificationLog> findByTargetType(TargetType targetType, Pageable pageable);
    Page<NotificationLog> findByStatus(String status, Pageable pageable);
    Page<NotificationLog> findByTargetTypeAndStatus(TargetType targetType, String status, Pageable pageable);

    // For stats (global counts)
    long countByTargetType(TargetType targetType);
    long countByStatus(String status);
    long countByTargetTypeAndStatus(TargetType targetType, String status);
}