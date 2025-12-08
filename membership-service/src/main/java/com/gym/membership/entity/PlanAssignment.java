package com.gym.membership.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "plan_assignments")
public class PlanAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long memberId; // UserId coming from UserService

    @ManyToOne
    @JoinColumn(name = "plan_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Plan plan;

    private LocalDate startDate;

    // REMOVE endDate STORAGE – use dynamic calculation instead
    // private LocalDate endDate;

    public Long getId() { return id; }

    public Long getMemberId() { return memberId; }
    public void setMemberId(Long memberId) { this.memberId = memberId; }

    public Plan getPlan() { return plan; }
    public void setPlan(Plan plan) { this.plan = plan; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    // DYNAMICALLY COMPUTED END DATE
    public LocalDate getEndDate() {
        if (startDate == null || plan == null) return null;
        return startDate.plusDays(plan.getDurationDays());
    }
}
