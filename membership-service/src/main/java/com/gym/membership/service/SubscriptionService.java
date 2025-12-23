package com.gym.membership.service;

import java.util.List;

import com.gym.membership.dto.PlanResponse;
import com.gym.membership.dto.SubscriptionRequest;
import com.gym.membership.entity.Subscription;

public interface SubscriptionService {
        void sendManualReceipt(com.gym.membership.dto.ManualReceiptRequest req);
    Subscription subscribe(SubscriptionRequest req);
    Subscription renew(SubscriptionRequest req);
    // confirmPayment method removed
    List<Subscription> getSubscriptionsByUser(Long userId);
    List<Subscription> getAllSubscriptions();
    void expireSubscriptions();
    PlanResponse getPlanForMember(Long memberId);
    PlanResponse assignPlan(Long memberId, Long planId, String startDate);
    void removePlanFromMember(Long memberId);
}
