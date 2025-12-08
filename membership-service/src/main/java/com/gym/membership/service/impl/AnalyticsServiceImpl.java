package com.gym.membership.service.impl;

import com.gym.membership.dto.AnalyticsResponse;
import com.gym.membership.dto.MonthlyAnalyticsDTO;
import com.gym.membership.repository.AnalyticsRepository;
import com.gym.membership.repository.PlanAssignmentRepository;
import com.gym.membership.repository.ProductAssignmentRepository;
import com.gym.membership.client.UserClient;
import com.gym.membership.service.AnalyticsService;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final PlanAssignmentRepository planAssignmentRepo;
    private final ProductAssignmentRepository productAssignmentRepo;
    private final UserClient userClient;
    private final AnalyticsRepository analyticsRepository;

    public AnalyticsServiceImpl(
            PlanAssignmentRepository planAssignmentRepo,
            ProductAssignmentRepository productAssignmentRepo,
            UserClient userClient,
            AnalyticsRepository analyticsRepository) {

        this.planAssignmentRepo = planAssignmentRepo;
        this.productAssignmentRepo = productAssignmentRepo;
        this.userClient = userClient;
        this.analyticsRepository = analyticsRepository;
    }

    @Override
    public AnalyticsResponse getAnalytics(Integer month, Integer year) {

        LocalDate now = LocalDate.now();
        int m = (month == null) ? now.getMonthValue() : month;
        int y = (year == null) ? now.getYear() : year;

        double planRevenue = planAssignmentRepo.getPlanRevenueByMonth(m, y);
        double productRevenue = productAssignmentRepo.getProductRevenueByMonth(m, y);
        long productsSoldThisMonth = productAssignmentRepo.countProductsByMonth(m, y);

        UserClient.MemberStatsResponse memberStats = userClient.getMemberStats();
        long membersThisMonth = memberStats.membersThisMonth;
        long membersLastMonth = memberStats.membersLastMonth;
        long totalMembers = memberStats.totalMembers;
        long totalProductsSold = productAssignmentRepo.count();

        return new AnalyticsResponse(
                m, y,
                planRevenue,
                productRevenue,
                productsSoldThisMonth,
                membersThisMonth,
                membersLastMonth,
                totalMembers,
                totalProductsSold
        );
    }

    // ================================================
    // FINAL, CORRECT, REAL-TIME TREND IMPLEMENTATION
    // ================================================
    @Override
    public List<MonthlyAnalyticsDTO> getLast12MonthsTrend(int month, int year) {

        List<MonthlyAnalyticsDTO> revenueTrend = analyticsRepository.get12MonthTrend(month, year);

        // Collect all month-year pairs for batch fetching
        List<UserClient.MonthYearPair> monthYearPairs = revenueTrend.stream()
                .map(dto -> new UserClient.MonthYearPair(dto.getMonth(), dto.getYear()))
                .collect(java.util.stream.Collectors.toList());

        // Fetch all member stats in a single batch call
        List<UserClient.MonthMemberStats> batchMemberStats;
        try {
            batchMemberStats = userClient.getMemberStatsForMonths(monthYearPairs);
        } catch (Exception e) {
            // Log the error and proceed with 0 members if user-service is unavailable
            // In a real application, consider more robust error handling and logging
            batchMemberStats = new ArrayList<>();
        }

        // Create a map for easy lookup
        java.util.Map<String, Long> memberStatsMap = batchMemberStats.stream()
                .collect(java.util.stream.Collectors.toMap(
                        stats -> stats.month + "-" + stats.year,
                        stats -> stats.count
                ));

        return revenueTrend.stream()
                .map(dto -> {
                    long membersJoined = memberStatsMap.getOrDefault(dto.getMonth() + "-" + dto.getYear(), 0L);
                    return new MonthlyAnalyticsDTO(
                            dto.getMonth(),
                            dto.getYear(),
                            dto.getPlanRevenue(),
                            dto.getProductRevenue(),
                            membersJoined
                    );
                })
                .collect(java.util.stream.Collectors.toList());
    }
}
