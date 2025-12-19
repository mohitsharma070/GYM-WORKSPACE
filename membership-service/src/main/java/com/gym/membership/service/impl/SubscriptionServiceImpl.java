package com.gym.membership.service.impl;

import com.gym.membership.client.UserClient;
import com.gym.membership.client.NotificationClient;
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

        // Simulate payment processing
        boolean paymentSuccessful = processPayment(req); // Assume this method exists and returns a boolean

        if (!paymentSuccessful) {
            // Optionally, send a payment failure notification
            try {
                com.gym.membership.dto.NotificationRequest notification = new com.gym.membership.dto.NotificationRequest();
                notification.setPhoneNumber(user.phone);
                notification.setType("PAYMENT_CONFIRMATION");
                notification.setMessage("Dear " + user.name + ", your payment for the plan '" + plan.getName() + "' failed. Please try again.");
                notificationClient.sendNotification(notification);
            } catch (Exception e) {
                System.err.println("Failed to send payment failure notification: " + e.getMessage());
            }
            throw new BadRequestException("Payment failed for user " + req.userId());
        }

        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(plan.getDurationDays());

        Subscription s = new Subscription();
        s.setUserId(req.userId());
        s.setPlan(plan);
        s.setStartDate(start);
        s.setEndDate(end);
        s.setStatus(Subscription.Status.ACTIVE);

        Subscription savedSubscription = subscriptionRepo.save(s);

        // Send WhatsApp notification for successful payment
        try {
            com.gym.membership.dto.NotificationRequest notification = new com.gym.membership.dto.NotificationRequest();
            notification.setPhoneNumber(user.phone);
            notification.setType("PAYMENT_CONFIRMATION");
            notification.setMessage("Dear " + user.name + ", your payment for the plan '" + plan.getName() + "' was successful. Your subscription is active until " + end + ".");
            notificationClient.sendNotification(notification);
        } catch (Exception e) {
            // Log error, but don't stop processing
            System.err.println("Failed to send payment confirmation notification: " + e.getMessage());
        }

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

        // Simulate payment processing
        boolean paymentSuccessful = processPayment(req);

        if (!paymentSuccessful) {
            throw new BadRequestException("Payment failed for user " + req.userId());
        }

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

    /**
     * Simulates a payment processing call to a payment gateway.
     * In a real application, this would involve integrating with a service like Stripe or PayPal.
     * @param req The subscription request containing payment details.
     * @return true if the payment is successful, false otherwise.
     */
    private boolean processPayment(SubscriptionRequest req) {
        // Here you would add your payment gateway logic.
        // For the purpose of this example, we'll assume the payment is always successful.
        System.out.println("Processing payment for user " + req.userId() + " for plan " + req.planId());
        return true;
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
       // PAYMENT CONFIRMATION IMPLEMENTATION
       @Override
       @Transactional
       public Subscription confirmPayment(Long subscriptionId) {
           Subscription subscription = subscriptionRepo.findById(subscriptionId)
                   .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + subscriptionId));
           if (subscription.isPaymentConfirmed()) {
               return subscription;
           }
           subscription.setPaymentConfirmed(true);
           subscription.setPaymentDate(LocalDate.now());
           subscriptionRepo.save(subscription);

           // Send WhatsApp notification for payment confirmation
           try {
               UserClient.UserResponse user = userClient.getUserById(subscription.getUserId());
               com.gym.membership.dto.NotificationRequest notification = new com.gym.membership.dto.NotificationRequest();
               notification.setPhoneNumber(user.phone);
               notification.setType("PAYMENT_CONFIRMATION");
               notification.setMessage("Dear " + user.name + ", your payment for the plan '" + subscription.getPlan().getName() + "' has been confirmed. Your subscription is active until " + subscription.getEndDate() + ".");
               notificationClient.sendNotification(notification);
           } catch (Exception e) {
               System.err.println("Failed to send payment confirmation notification: " + e.getMessage());
           }
           return subscription;
       }
}
