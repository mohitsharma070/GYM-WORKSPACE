package com.gym.userservice.controller;

import com.gym.userservice.dto.*;

import com.gym.userservice.entity.User;
import com.gym.userservice.service.IUserService;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping
public class UserController {

    private final IUserService service;

    public UserController(IUserService service) {
        this.service = service;
    }

    // ==============================================
    // REGISTER ENDPOINTS (return created user JSON)
    // ==============================================

    @PostMapping("/auth/admin/register")
    public ResponseEntity<?> registerAdmin(@RequestBody AdminRegisterRequest request) {
        User created = service.registerAdmin(request);
        created.setPassword(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/auth/trainer/register")
    public ResponseEntity<?> registerTrainer(@RequestBody TrainerRegisterRequest request) {
        User created = service.registerTrainer(request);
        created.setPassword(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/auth/member/register")
    public ResponseEntity<?> registerMember(@RequestBody MemberRegisterRequest request) {
        User created = service.registerMember(request);
        created.setPassword(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ==============================================
    // GET USER BY EMAIL (AUTH)
    // ==============================================

    @GetMapping("/auth/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        UserResponse userResponse = service.getByEmail(auth.getName());
        return ResponseEntity.ok(userResponse);
    }

    // ==============================================
    // GET USER BY ID
    // ==============================================

    @GetMapping("/auth/user/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        UserResponse userResponse = service.getById(id);
        return ResponseEntity.ok(userResponse);
    }

    @GetMapping("/auth/user/{id}/exists")
    public ResponseEntity<Boolean> userExists(@PathVariable Long id) {
        return ResponseEntity.ok(service.existsById(id));
    }

    // ==============================================
    // ADMIN – FETCH LISTS
    // ==============================================

    @GetMapping("/auth/admin/all")
    public ResponseEntity<Page<UserResponse>> getAllUsersForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(service.getAllUsers(page, size, sortBy, sortDir, search));
    }

    @GetMapping("/auth/admin/members")
    public ResponseEntity<Page<User>> getAllMembersForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(service.getAllMembersForAdmin(page, size, sortBy, sortDir, search));
    }

    @GetMapping("/auth/admin/trainers")
    public ResponseEntity<Page<UserResponse>> getAllTrainersForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search
    ) {
        Page<User> trainers = service.getAllTrainers(page, size, sortBy, sortDir, search);
        Page<UserResponse> trainerResponses = trainers.map(user -> ((com.gym.userservice.service.impl.UserServiceImpl)service).toUserResponse(user));
        return ResponseEntity.ok(trainerResponses);
    }

    // ==============================================
    // SOFT DELETE USER
    // ==============================================

    @DeleteMapping("/auth/admin/user/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        service.deleteUser(id);  // <-- Now soft delete inside service
        return ResponseEntity.noContent().build();
    }

    // ==============================================
    // REACTIVATE USER
    // ==============================================

    @PostMapping("/auth/member/reactivate")
    public ResponseEntity<?> reactivateUser(@RequestBody Map<String, String> body) {
        User reactivated = service.reactivateUser(body.get("email"));
        reactivated.setPassword(null);
        return ResponseEntity.ok(reactivated);
    }

    // ==============================================
    // UPDATE USER
    // ==============================================

    @PutMapping("/auth/user/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates
    ) {
        User updated = service.updateUser(id, updates);
        updated.setPassword(null);
        return ResponseEntity.ok(updated);
    }

    // ==============================================
    // UPDATE ADMIN PROFILE
    // ==============================================

    @PutMapping("/auth/admin/profile")
    public ResponseEntity<?> updateAdminProfile(@RequestBody Map<String, Object> updates, Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        UserResponse userResponse = service.getByEmail(auth.getName());
        if (userResponse == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Admin not found");
        }
        User updated = service.updateUser(userResponse.getId(), updates);
        updated.setPassword(null);
        return ResponseEntity.ok(updated);
    }

    // ==============================================
    // TRAINER – GET MEMBERS
    // ==============================================

    @GetMapping("/auth/trainer/members")
    public ResponseEntity<Page<User>> getAllMembersForTrainer(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(service.getAllMembers(page, size, sortBy, sortDir, search));
    }

    // ==============================================
    // MEMBER STATISTICS
    // ==============================================

    @GetMapping("/auth/stats/members")
    public ResponseEntity<?> getMemberStats() {
        long total = service.countTotalMembers();
        long thisMonth = service.countMembersThisMonth();
        long lastMonth = service.countMembersLastMonth();

        return ResponseEntity.ok(
                Map.of(
                        "totalMembers", total,
                        "membersThisMonth", thisMonth,
                        "membersLastMonth", lastMonth
                )
        );
    }

    @GetMapping("/auth/stats/members/{year}/{month}")
    public ResponseEntity<MonthMemberStatsResponse> getMemberStatsForMonth(
            @PathVariable int year,
            @PathVariable int month
    ) {
        long count = service.countMembersByMonthAndYear(month, year);
        return ResponseEntity.ok(new MonthMemberStatsResponse(count));
    }

    // ==============================================
    // SEND PROMOTIONAL MESSAGE
    // ==============================================
    @PostMapping("/auth/admin/send-promotional-message")
    public ResponseEntity<?> sendPromotionalMessage(@RequestBody com.gym.userservice.dto.PromotionalMessageRequest request) {
        service.sendPromotionalMessage(request.getMessage());
        return ResponseEntity.noContent().build();
    }

    // ==============================================
    // FINGERPRINT VERIFICATION
    // ==============================================

    @PostMapping("/auth/member/verify-fingerprint")
    public ResponseEntity<?> verifyFingerprint(@RequestBody FingerprintVerifyRequest request) {
        boolean verified = service.verifyFingerprint(request.getEmail(), request.getFingerprint());
        if (verified) {
            return ResponseEntity.ok(Map.of("message", "Fingerprint verified successfully."));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Fingerprint verification failed."));
        }
    }
}
