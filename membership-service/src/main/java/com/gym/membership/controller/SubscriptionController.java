package com.gym.membership.controller;

import com.gym.membership.dto.PlanResponse;
import com.gym.membership.dto.SubscriptionRequest;
import com.gym.membership.entity.Subscription;
import com.gym.membership.service.SubscriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    // -----------------------------------------
    // CREATE SUBSCRIPTION
    // -----------------------------------------
    @PostMapping("/subscriptions")
    public ResponseEntity<Subscription> subscribe(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody SubscriptionRequest req
    ) {
        Subscription s = subscriptionService.subscribe(req);
        return ResponseEntity.status(201).body(s);
    }

    // -----------------------------------------
    // RENEW SUBSCRIPTION
    // -----------------------------------------
    @PostMapping("/subscriptions/renew")
    public ResponseEntity<Subscription> renew(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody SubscriptionRequest req
    ) {
        Subscription s = subscriptionService.renew(req);
        return ResponseEntity.status(201).body(s);
    }

    // -----------------------------------------
    // GET SUBSCRIPTIONS BY USER
    // -----------------------------------------
    @GetMapping("/subscriptions/user/{userId}")
    public ResponseEntity<List<Subscription>> byUser(@PathVariable Long userId) {
        return ResponseEntity.ok(subscriptionService.getSubscriptionsByUser(userId));
    }

    // -----------------------------------------
    // GET ALL SUBSCRIPTIONS
    // -----------------------------------------
    @GetMapping("/subscriptions")
    public ResponseEntity<List<Subscription>> all() {
        return ResponseEntity.ok(subscriptionService.getAllSubscriptions());
    }

    // Get member's assigned plan
    @GetMapping("/member/{memberId}/plan")
    public ResponseEntity<PlanResponse> getMemberPlan(@PathVariable Long memberId) {
        PlanResponse response = subscriptionService.getPlanForMember(memberId);
        return ResponseEntity.ok(response);
    }

    // ASSIGN A PLAN TO MEMBER
    @PostMapping("/member/{memberId}/plan/{planId}")
    public ResponseEntity<PlanResponse> assignPlan(
            @PathVariable Long memberId,
            @PathVariable Long planId,
            @RequestParam String startDate
    ) {
        return ResponseEntity.ok(subscriptionService.assignPlan(memberId, planId, startDate));
    }

    // REMOVE assigned plan from member
    @DeleteMapping("/member/{memberId}/plan")
    public ResponseEntity<Void> removePlan(@PathVariable Long memberId) {
        subscriptionService.removePlanFromMember(memberId);
        return ResponseEntity.noContent().build();
    }
}
