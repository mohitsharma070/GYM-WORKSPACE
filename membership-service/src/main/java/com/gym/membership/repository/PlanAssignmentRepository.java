package com.gym.membership.repository;

import com.gym.membership.entity.PlanAssignment;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.Optional;

public interface PlanAssignmentRepository extends JpaRepository<PlanAssignment, Long> {
    Optional<PlanAssignment> findByMemberId(Long memberId);

    // Total plan revenue
    @Query("""
        SELECT COALESCE(SUM(pa.plan.price), 0)
        FROM PlanAssignment pa
    """)
    double getTotalPlanRevenue();

    @Query("""
        SELECT COALESCE(SUM(pa.plan.price), 0)
        FROM PlanAssignment pa
        WHERE EXTRACT(MONTH FROM pa.startDate) = :month
          AND EXTRACT(YEAR FROM pa.startDate)  = :year
    """)
    double getPlanRevenueByMonth(@Param("month") int month, @Param("year") int year);


}
