package com.gym.userservice.service;

import com.gym.userservice.dto.AdminRegisterRequest;
import com.gym.userservice.dto.MemberRegisterRequest;
import com.gym.userservice.dto.TrainerRegisterRequest;
import com.gym.userservice.dto.UserResponse;
import com.gym.userservice.entity.User;

import java.util.List;
import java.util.Map;

public interface IUserService {

    // ---------- Registration ----------
    User registerAdmin(AdminRegisterRequest request);
    User registerTrainer(TrainerRegisterRequest request);
    User registerMember(MemberRegisterRequest request);

    // ---------- Login ----------
    UserResponse getByEmail(String email);

    // ---------- Feign: get user by ID ----------
    UserResponse getById(Long id);
    boolean existsById(Long id);

    // ---------- Admin ----------
    List<UserResponse> getAllUsers();
    List<User> getAllMembersForAdmin();
    List<User> getAllTrainers();

    // ---------- Soft Delete ----------
    void deleteUser(Long id);   // ← this now performs SOFT DELETE

    // OPTIONAL (restore soft deleted users)
    User restoreUser(Long id);

    User reactivateUser(String email);

    // ---------- Trainer ----------
    List<User> getAllMembers();

    // ---------- Update User ----------
    User updateUser(Long id, Map<String, Object> updates);

    // ==========================================================
    // STATISTICS
    // ==========================================================
    long countTotalMembers();
    long countMembersThisMonth();
    long countMembersLastMonth();
    long countMembersByMonthAndYear(int month, int year);

    boolean verifyFingerprint(String email, String fingerprint);

    void sendPromotionalMessage(String message);
}
