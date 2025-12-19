package com.notificationservice.repository;

import com.notificationservice.model.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.notificationservice.enums.TargetType;


@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    Page<NotificationLog> findByTargetType(TargetType targetType, Pageable pageable);
    Page<NotificationLog> findByStatus(String status, Pageable pageable);
    Page<NotificationLog> findByTargetTypeAndStatus(TargetType targetType, String status, Pageable pageable);
}