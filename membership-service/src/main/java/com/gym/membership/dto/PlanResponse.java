package com.gym.membership.dto;

import com.gym.membership.entity.Plan;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public record PlanResponse(Long id, String name, String description, double price, int durationDays, LocalDate startDate, LocalDate endDate, boolean expired, long daysLeft) {
    public PlanResponse(Plan plan, LocalDate start, LocalDate end) {
        this(plan.getId(), plan.getName(), plan.getDescription(), plan.getPrice(), plan.getDurationDays(), start, end, isExpired(end), daysLeft(end));
    }

    private static boolean isExpired(LocalDate end) {
        if (end == null) {
            return false;
        }
        return end.isBefore(LocalDate.now());
    }

    private static long daysLeft(LocalDate end) {
        if (end == null || isExpired(end)) {
            return 0;
        }
        return ChronoUnit.DAYS.between(LocalDate.now(), end);
    }
}
