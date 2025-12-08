package com.gym.membership.controller;

import com.gym.membership.dto.PlanRequest;
import com.gym.membership.entity.Plan;
import com.gym.membership.service.PlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/plans")
public class PlanController {

    private final PlanService planService;

    @Autowired
    public PlanController(PlanService planService) {
        this.planService = planService;
    }

    // Get all plans
    @GetMapping
    public ResponseEntity<List<Plan>> all() {
        return ResponseEntity.ok(planService.getAllPlans());
    }

    // Create plan
    @PostMapping
    public ResponseEntity<Plan> create(@RequestBody PlanRequest req) {
        Plan p = planService.createPlan(req);
        return ResponseEntity.status(201).body(p);
    }

    // Update plan
    @PutMapping("/{id}")
    public ResponseEntity<Plan> update(@PathVariable Long id, @RequestBody PlanRequest req) {
        Plan updated = planService.updatePlan(id, req);
        return ResponseEntity.ok(updated);
    }

    // Delete plan
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        planService.deletePlan(id);
        return ResponseEntity.ok().build();
    }
}
