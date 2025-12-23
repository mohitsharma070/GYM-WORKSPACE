package com.gym.membership.service.impl;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gym.membership.client.NotificationClient;
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

@Service
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionRepository subscriptionRepo;
    private final PlanRepository planRepo;
    private final PlanAssignmentRepository planAssignmentRepo;
    private final UserClient userClient;
    private final NotificationClient notificationClient;

    public SubscriptionServiceImpl(SubscriptionRepository subscriptionRepo,
                                   PlanRepository planRepo,
                                   PlanAssignmentRepository planAssignmentRepo,
                                   UserClient userClient,
                                   NotificationClient notificationClient) {
        this.subscriptionRepo = subscriptionRepo;
        this.planRepo = planRepo;
        this.planAssignmentRepo = planAssignmentRepo;
        this.userClient = userClient;
        this.notificationClient = notificationClient;
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

        // Payment logic removed

        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(plan.getDurationDays());

        Subscription s = new Subscription();
        s.setUserId(req.userId());
        s.setPlan(plan);
        s.setStartDate(start);
        s.setEndDate(end);
        s.setStatus(Subscription.Status.ACTIVE);

        Subscription savedSubscription = subscriptionRepo.save(s);

        // Payment confirmation notification removed

        return savedSubscription;
    }

    @Override
    @Transactional
    public Subscription renew(SubscriptionRequest req) {
        if (!userClient.userExists(req.userId())) {
            throw new ResourceNotFoundException("User not found with id: " + req.userId());
        }

        UserClient.UserResponse user = userClient.getUserById(req.userId());

        if (!"ROLE_MEMBER".equalsIgnoreCase(user.role)) {
            throw new BadRequestException("Only MEMBERS can renew a plan");
        }

        Subscription oldSubscription = subscriptionRepo.findTopByUserIdOrderByEndDateDesc(req.userId())
                .orElseThrow(() -> new BadRequestException("No existing subscription found to renew for user " + req.userId() + ". Use subscribe instead."));

        Plan plan = oldSubscription.getPlan();

        // Payment logic removed

        LocalDate today = LocalDate.now();
        LocalDate newStartDate = oldSubscription.getEndDate().isBefore(today) ? today : oldSubscription.getEndDate();
        LocalDate newEndDate = newStartDate.plusDays(plan.getDurationDays());

        // Expire the old subscription if it's still active
        if (oldSubscription.getStatus() == Subscription.Status.ACTIVE) {
            oldSubscription.setStatus(Subscription.Status.EXPIRED);
            subscriptionRepo.save(oldSubscription);
        }

        Subscription newSubscription = new Subscription();
        newSubscription.setUserId(req.userId());
        newSubscription.setPlan(plan);
        newSubscription.setStartDate(newStartDate);
        newSubscription.setEndDate(newEndDate);
        newSubscription.setStatus(Subscription.Status.ACTIVE);

        Subscription savedSubscription = subscriptionRepo.save(newSubscription);

        // Send WhatsApp notification for successful renewal
        try {
            com.gym.membership.dto.NotificationRequest notification = new com.gym.membership.dto.NotificationRequest();
            notification.setPhoneNumber(user.phone);
            notification.setType("MEMBERSHIP_RENEWAL");
            notification.setMessage("Dear " + user.name + ", your membership has been successfully renewed. Your new subscription is active until " + newEndDate + ".");
            notificationClient.sendNotification(notification);
        } catch (Exception e) {
            System.err.println("Failed to send renewal notification: " + e.getMessage());
        }

        return savedSubscription;
    }

    // Payment processing method removed

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
            // Send WhatsApp notification for expired membership
            try {
                UserClient.UserResponse user = userClient.getUserById(s.getUserId());
                com.gym.membership.dto.NotificationRequest notification = new com.gym.membership.dto.NotificationRequest();
                notification.setPhoneNumber(user.phone);
                notification.setType("MEMBERSHIP_EXPIRY");
                notification.setMessage("Dear " + user.name + ", your membership has expired. Please renew to continue enjoying our services.");
                notificationClient.sendNotification(notification);
            } catch (Exception e) {
                // Log error, but don't stop processing
                System.err.println("Failed to send expiry notification: " + e.getMessage());
            }
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

        // Send WhatsApp notification for workout plan assigned
        try {
            UserClient.UserResponse user = userClient.getUserById(memberId);
            com.gym.membership.dto.NotificationRequest notification = new com.gym.membership.dto.NotificationRequest();
            notification.setPhoneNumber(user.phone);
            notification.setType("WORKOUT_PLAN_ASSIGNED");
            notification.setMessage("Hi " + user.name + ", a new workout plan has been assigned to you: " + plan.getName() + ". Start Date: " + startDate + ".");
            notificationClient.sendNotification(notification);
        } catch (Exception e) {
            System.err.println("Failed to send workout plan assigned notification: " + e.getMessage());
        }

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
    @Override
    public void sendManualReceipt(com.gym.membership.dto.ManualReceiptRequest req) {
        // Fetch member and plan info automatically
        UserClient.UserResponse user = userClient.getUserById(req.getUserId());
        Plan plan = planRepo.findById(req.getPlanId())
            .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id: " + req.getPlanId()));
        // Find latest subscription for dates
        Subscription subscription = subscriptionRepo.findTopByUserIdOrderByEndDateDesc(req.getUserId())
            .orElse(null);
        String startDate = subscription != null ? String.valueOf(subscription.getStartDate()) : "-";
        String endDate = subscription != null ? String.valueOf(subscription.getEndDate()) : "-";

        StringBuilder receipt = new StringBuilder();
        receipt.append("--- GYM RECEIPT ---\n");
        receipt.append("Member: ").append(user.name).append("\n");
        receipt.append("Plan: ").append(plan.getName()).append("\n");
        receipt.append("Start Date: ").append(startDate).append("\n");
        receipt.append("End Date: ").append(endDate).append("\n");
        if (req.getAmount() != null) receipt.append("Amount: ").append(req.getAmount()).append("\n");
        if (req.getPaymentMethod() != null) receipt.append("Payment Method: ").append(req.getPaymentMethod()).append("\n");
        if (req.getTransactionId() != null) receipt.append("Transaction ID: ").append(req.getTransactionId()).append("\n");
        receipt.append("--------------------\n");
        // message is set automatically; no manual message field

        com.gym.membership.dto.NotificationRequest notification = new com.gym.membership.dto.NotificationRequest();
        notification.setPhoneNumber(user.phone);
        notification.setType("MEMBERSHIP_RENEWAL");
        notification.setMessage(receipt.toString());
        notificationClient.sendNotification(notification);
    }
}
