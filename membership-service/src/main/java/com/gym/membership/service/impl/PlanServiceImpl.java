package com.gym.membership.service.impl;

import com.gym.membership.dto.PlanRequest;
import com.gym.membership.entity.Plan;
import com.gym.membership.exception.BadRequestException;
import com.gym.membership.exception.ResourceNotFoundException;
import com.gym.membership.repository.PlanRepository;
import com.gym.membership.service.PlanService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlanServiceImpl implements PlanService {

    private final PlanRepository planRepo;

    public PlanServiceImpl(PlanRepository planRepo) {
        this.planRepo = planRepo;
    }

    @Override
    public Plan createPlan(PlanRequest req) {
        if (req.durationDays() <= 0) {
            throw new BadRequestException("Duration must be greater than 0 days");
        }

        Plan p = new Plan();
        p.setName(req.name());
        p.setDescription(req.description());
        p.setPrice(req.price());
        p.setDurationDays(req.durationDays());
        return planRepo.save(p);
    }

    @Override
    public Plan updatePlan(Long id, PlanRequest req) {

        Plan p = planRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id: " + id));

        if (req.durationDays() <= 0) {
            throw new BadRequestException("Duration must be greater than 0 days");
        }

        p.setName(req.name());
        p.setDescription(req.description());
        p.setPrice(req.price());
        p.setDurationDays(req.durationDays());
        return planRepo.save(p);
    }

    @Override
    public void deletePlan(Long id) {
        if (!planRepo.existsById(id)) {
            throw new ResourceNotFoundException("Plan not found with id: " + id);
        }

        planRepo.deleteById(id);
    }

    @Override
    public List<Plan> getAllPlans() {
        return planRepo.findAll();
    }
}
