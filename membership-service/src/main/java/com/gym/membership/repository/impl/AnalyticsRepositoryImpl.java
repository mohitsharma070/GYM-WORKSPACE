package com.gym.membership.repository.impl;

import com.gym.membership.dto.MonthlyAnalyticsDTO;
import com.gym.membership.repository.AnalyticsRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Collectors;

@Repository
public class AnalyticsRepositoryImpl implements AnalyticsRepository {

    @PersistenceContext
    private EntityManager em;

    @Override
    public List<MonthlyAnalyticsDTO> get12MonthTrend(int month, int year) {

        // IMPORTANT:
        // This query returns ONLY revenue.
        // membersThisMonth must come from UserClient (real join count).

        String sql = """
            SELECT 
                month,
                year,
                COALESCE(SUM(plan_price), 0) AS planRevenue,
                COALESCE(SUM(product_price), 0) AS productRevenue
            FROM monthly_analytics_view
            WHERE month_start BETWEEN 
                DATE_TRUNC(
                    'month',
                    TO_DATE(:year || '-' || :month || '-01', 'YYYY-MM-DD')
                ) - INTERVAL '11 months'
                AND DATE_TRUNC(
                    'month',
                    TO_DATE(:year || '-' || :month || '-01', 'YYYY-MM-DD')
                )
            GROUP BY year, month
            ORDER BY year, month;
        """;

        List<Object[]> results = em.createNativeQuery(sql)
                .setParameter("month", month)
                .setParameter("year", year)
                .getResultList();

        return results.stream()
                .map(row -> new MonthlyAnalyticsDTO(
                        ((Number) row[0]).intValue(),
                        ((Number) row[1]).intValue(),
                        ((Number) row[2]).doubleValue(),
                        ((Number) row[3]).doubleValue(),
                        0L // membersThisMonth is fetched later in the service layer
                ))
                .collect(Collectors.toList());
    }
}
