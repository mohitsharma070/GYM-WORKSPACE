package com.gym.membership.repository;

import com.gym.membership.entity.ProductAssignment;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface ProductAssignmentRepository extends JpaRepository<ProductAssignment, Long> {

    List<ProductAssignment> findByMemberId(Long memberId);

    @Query("""
        SELECT COALESCE(SUM(pa.product.price), 0)
        FROM ProductAssignment pa
    """)
    double getTotalProductRevenue();

    @Query("""
        SELECT COALESCE(SUM(pa.product.price), 0)
        FROM ProductAssignment pa
        WHERE EXTRACT(MONTH FROM pa.assignedDate) = :month
          AND EXTRACT(YEAR FROM pa.assignedDate)  = :year
    """)
    double getProductRevenueByMonth(@Param("month") int month, @Param("year") int year);

    @Query("""
        SELECT COUNT(pa)
        FROM ProductAssignment pa
        WHERE EXTRACT(MONTH FROM pa.assignedDate) = :month
          AND EXTRACT(YEAR FROM pa.assignedDate)  = :year
    """)
    long countProductsByMonth(@Param("month") int month, @Param("year") int year);

}
