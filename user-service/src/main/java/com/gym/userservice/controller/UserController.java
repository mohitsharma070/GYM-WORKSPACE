package com.gym.userservice.controller;

import com.gym.userservice.dto.AdminRegisterRequest;
import com.gym.userservice.dto.MemberRegisterRequest;
import com.gym.userservice.dto.MonthMemberStatsResponse;
import com.gym.userservice.dto.TrainerRegisterRequest;
import com.gym.userservice.dto.FingerprintVerifyRequest;

import com.gym.userservice.entity.User;
import com.gym.userservice.service.IUserService;

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

        User user = service.getByEmail(auth.getName());
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    // ==============================================
    // GET USER BY ID
    // ==============================================

    @GetMapping("/auth/user/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        User user = service.getById(id);
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/auth/user/{id}/exists")
    public ResponseEntity<Boolean> userExists(@PathVariable Long id) {
        return ResponseEntity.ok(service.existsById(id));
    }

    // ==============================================
    // ADMIN – FETCH LISTS
    // ==============================================

    @GetMapping("/auth/admin/all")
    public ResponseEntity<?> getAllUsersForAdmin() {
        return ResponseEntity.ok(service.getAllUsers());
    }

    @GetMapping("/auth/admin/members")
    public ResponseEntity<?> getAllMembersForAdmin() {
        return ResponseEntity.ok(service.getAllMembersForAdmin());
    }

    @GetMapping("/auth/admin/trainers")
    public ResponseEntity<?> getAllTrainersForAdmin() {
        return ResponseEntity.ok(service.getAllTrainers());
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
    // TRAINER – GET MEMBERS
    // ==============================================

    @GetMapping("/auth/trainer/members")
    public ResponseEntity<?> getAllMembersForTrainer() {
        return ResponseEntity.ok(service.getAllMembers());
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
