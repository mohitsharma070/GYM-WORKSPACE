package com.gym.membership.controller;

import com.gym.membership.dto.AnalyticsResponse;
import com.gym.membership.dto.MonthlyAnalyticsDTO;
import com.gym.membership.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year
    ) {
        return ResponseEntity.ok(analyticsService.getAnalytics(month, year));
    }

    // ============================================
    // NEW ENDPOINT: 12-MONTH TREND ANALYTICS
    // ============================================
    @GetMapping("/trend")
    public ResponseEntity<List<MonthlyAnalyticsDTO>> get12MonthTrend(
            @RequestParam int month,
            @RequestParam int year
    ) {
        return ResponseEntity.ok(
                analyticsService.getLast12MonthsTrend(month, year)
        );
    }
}
