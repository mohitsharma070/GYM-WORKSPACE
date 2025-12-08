package com.gym.membership.service.impl;

import com.gym.membership.client.UserClient;
import com.gym.membership.dto.PlanResponse;
import com.gym.membership.dto.SubscriptionRequest;
import com.gym.membership.entity.Plan;
import com.gym.membership.entity.PlanAssignment;
import com.gym.membership.entity.Subscription;
import com.gym.membership.exception.BadRequestException;
import com.gym.membership.exception.ResourceNotFoundException;
import com.gym.membership.repository.PlanAssignmentRepository;
import com.gym.membership.repository.PlanRepository;
import com.gym.membership.repository.SubscriptionRepository;
import com.gym.membership.service.SubscriptionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionRepository subscriptionRepo;
    private final PlanRepository planRepo;
    private final PlanAssignmentRepository planAssignmentRepo;
    private final UserClient userClient;

    public SubscriptionServiceImpl(SubscriptionRepository subscriptionRepo,
                                   PlanRepository planRepo,
                                   PlanAssignmentRepository planAssignmentRepo,
                                   UserClient userClient) {
        this.subscriptionRepo = subscriptionRepo;
        this.planRepo = planRepo;
        this.planAssignmentRepo = planAssignmentRepo;
        this.userClient = userClient;
    }

    @Override
    @Transactional
    public Subscription subscribe(SubscriptionRequest req) {

        if (!userClient.userExists(req.userId())) {
            throw new ResourceNotFoundException("User not found with id: " + req.userId());
        }

        UserClient.UserResponse user = userClient.getUserById(req.userId());

        if (!"ROLE_MEMBER".equalsIgnoreCase(user.role)) {
            throw new BadRequestException("Only MEMBERS can subscribe to a plan");
        }

        Plan plan = planRepo.findById(req.planId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id: " + req.planId()));

        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(plan.getDurationDays());

        Subscription s = new Subscription();
        s.setUserId(req.userId());
        s.setPlan(plan);
        s.setStartDate(start);
        s.setEndDate(end);
        s.setStatus(Subscription.Status.ACTIVE);

        return subscriptionRepo.save(s);
    }

    @Override
    public List<Subscription> getSubscriptionsByUser(Long userId) {
        return subscriptionRepo.findByUserId(userId);
    }

    @Override
    public List<Subscription> getAllSubscriptions() {
        return subscriptionRepo.findAll();
    }

    @Override
    public void expireSubscriptions() {
        LocalDate today = LocalDate.now();

        List<Subscription> expiring = subscriptionRepo
                .findByEndDateBeforeAndStatus(today, Subscription.Status.ACTIVE);

        for (Subscription s : expiring) {
            s.setStatus(Subscription.Status.EXPIRED);
        }

        if (!expiring.isEmpty()) {
            subscriptionRepo.saveAll(expiring);
        }
    }

    @Override
    public PlanResponse getPlanForMember(Long memberId) {
        return planAssignmentRepo.findByMemberId(memberId)
                .map(pa -> {
                    LocalDate start = pa.getStartDate();
                    LocalDate end = (start != null && pa.getPlan() != null)
                            ? start.plusDays(pa.getPlan().getDurationDays())
                            : null;

                    return new PlanResponse(pa.getPlan(), start, end);
                })
                .orElse(null);
    }

    /**
     * Assigns a plan to a member (create or update assignment), sets start date,
     * computes the end date based on plan.durationDays and returns PlanResponse.
     *
     * @param memberId member id
     * @param planId   plan id to assign
     * @param startDateStr start date string (ISO yyyy-MM-dd)
     * @return PlanResponse containing plan + start/end dates
     */
    @Override
    public PlanResponse assignPlan(Long memberId, Long planId, String startDateStr) {

        // 1. Validate plan
        Plan plan = planRepo.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id: " + planId));

        // 2. Parse start date
        LocalDate startDate;
        try {
            startDate = LocalDate.parse(startDateStr);
        } catch (Exception e) {
            throw new BadRequestException("Invalid startDate format. Expected yyyy-MM-dd");
        }

        // 3. Find existing assignment OR create new
        PlanAssignment pa = planAssignmentRepo.findByMemberId(memberId)
                .orElseGet(PlanAssignment::new);

        pa.setMemberId(memberId);
        pa.setPlan(plan);
        pa.setStartDate(startDate);

        // 4. Save assignment
        PlanAssignment saved = planAssignmentRepo.save(pa);

        // 5. Compute endDate dynamically (NOT stored in DB)
        LocalDate endDate = saved.getEndDate();

        return new PlanResponse(saved.getPlan(), saved.getStartDate(), endDate);
    }

    @Override
    public void removePlanFromMember(Long memberId) {
        var assignment = planAssignmentRepo.findByMemberId(memberId)
                .orElse(null);

        if (assignment != null) {
            planAssignmentRepo.delete(assignment);
        }
    }
}
