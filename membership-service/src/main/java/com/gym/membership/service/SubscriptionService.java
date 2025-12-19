package com.gym.membership.service;

import com.gym.membership.dto.PlanResponse;
import com.gym.membership.dto.SubscriptionRequest;
import com.gym.membership.entity.Subscription;

import java.util.List;

public interface SubscriptionService {
    Subscription subscribe(SubscriptionRequest req);
    Subscription renew(SubscriptionRequest req);
    Subscription confirmPayment(Long subscriptionId);
    List<Subscription> getSubscriptionsByUser(Long userId);
    List<Subscription> getAllSubscriptions();
    void expireSubscriptions();
    PlanResponse getPlanForMember(Long memberId);
    PlanResponse assignPlan(Long memberId, Long planId, String startDate);
    void removePlanFromMember(Long memberId);
}
