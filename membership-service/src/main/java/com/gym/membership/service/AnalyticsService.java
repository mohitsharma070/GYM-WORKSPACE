package com.gym.membership.service;

import com.gym.membership.dto.AnalyticsResponse;
import com.gym.membership.dto.MonthlyAnalyticsDTO;

import java.util.List;

public interface AnalyticsService {

    AnalyticsResponse getAnalytics(Integer month, Integer year);

    // ============================================
    // NEW METHOD FOR 12-MONTH TREND
    // ============================================
    List<MonthlyAnalyticsDTO> getLast12MonthsTrend(int month, int year);
}
