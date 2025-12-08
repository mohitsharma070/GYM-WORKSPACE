package com.gym.membership.service;

import com.gym.membership.dto.PlanRequest;
import com.gym.membership.entity.Plan;

import java.util.List;

public interface PlanService {
    Plan createPlan(PlanRequest req);
    Plan updatePlan(Long id, PlanRequest req);
    void deletePlan(Long id);
    List<Plan> getAllPlans();
}
