package com.gym.membership.repository;

import com.gym.membership.dto.MonthlyAnalyticsDTO;

import java.util.List;

public interface AnalyticsRepository {
    List<MonthlyAnalyticsDTO> get12MonthTrend(int month, int year);
}
