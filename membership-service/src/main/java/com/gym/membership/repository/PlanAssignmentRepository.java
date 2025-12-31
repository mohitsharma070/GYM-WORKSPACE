
package com.gym.membership.repository;
import com.gym.membership.entity.PlanAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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



        // Count of active plans (endDate >= today) using native SQL for PostgreSQL
        @Query(value = "SELECT COUNT(*) FROM plan_assignments pa JOIN plans p ON pa.plan_id = p.id WHERE pa.start_date IS NOT NULL AND pa.plan_id IS NOT NULL AND (pa.start_date + (p.duration_days || ' days')::interval) >= :today", nativeQuery = true)
        long countActivePlans(@Param("today") java.sql.Date today);

        // Count of expired plans (endDate < today) using native SQL for PostgreSQL
        @Query(value = "SELECT COUNT(*) FROM plan_assignments pa JOIN plans p ON pa.plan_id = p.id WHERE pa.start_date IS NOT NULL AND pa.plan_id IS NOT NULL AND (pa.start_date + (p.duration_days || ' days')::interval) < :today", nativeQuery = true)
        long countExpiredPlans(@Param("today") java.sql.Date today);


}
