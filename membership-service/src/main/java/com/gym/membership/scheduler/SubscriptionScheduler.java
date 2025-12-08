package com.gym.membership.scheduler;

import com.gym.membership.service.SubscriptionService;
import com.gym.membership.service.AnalyticsService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class SubscriptionScheduler {

    private final SubscriptionService subscriptionService;
    private final AnalyticsService analyticsService;

    public SubscriptionScheduler(SubscriptionService subscriptionService,
                                 AnalyticsService analyticsService) {
        this.subscriptionService = subscriptionService;
        this.analyticsService = analyticsService;
    }

    // ---------------------------------------------
    // DAILY SUBSCRIPTION EXPIRY CHECK (02:00 AM)
    // ---------------------------------------------
    @Scheduled(cron = "${scheduler.daily-check.cron:0 0 2 * * *}")
    public void dailyExpireCheck() {
        subscriptionService.expireSubscriptions();
    }
}
