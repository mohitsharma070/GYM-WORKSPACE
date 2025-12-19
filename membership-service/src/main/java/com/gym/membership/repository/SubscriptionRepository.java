package com.gym.membership.repository;

import com.gym.membership.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByUserId(Long userId);
    Optional<Subscription> findTopByUserIdOrderByEndDateDesc(Long userId);
    List<Subscription> findByStatus(Subscription.Status status);
    List<Subscription> findByEndDateBeforeAndStatus(LocalDate date, Subscription.Status status);
}
