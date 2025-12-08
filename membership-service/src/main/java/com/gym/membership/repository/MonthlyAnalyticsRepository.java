package com.gym.membership.repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface MonthlyAnalyticsRepository {

    @Modifying
    @Transactional
    @Query(
            value = """
                INSERT INTO monthly_analytics 
                (month, year, plan_revenue, product_revenue, total_revenue, products_sold, members_registered)
                VALUES (:month, :year, :pRev, :prodRev, :totalRev, :prodSold, :members)
                ON CONFLICT (month, year)
                DO UPDATE SET
                    plan_revenue = EXCLUDED.plan_revenue,
                    product_revenue = EXCLUDED.product_revenue,
                    total_revenue = EXCLUDED.total_revenue,
                    products_sold = EXCLUDED.products_sold,
                    members_registered = EXCLUDED.members_registered;
                """,
            nativeQuery = true
    )
    void saveMonthlyRecord(
            int month,
            int year,
            double pRev,
            double prodRev,
            double totalRev,
            long prodSold,
            long members
    );
}
