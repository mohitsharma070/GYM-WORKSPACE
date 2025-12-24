package com.gym.userservice.service.impl;

import com.gym.userservice.dto.*;
import com.gym.userservice.enums.TargetType;
import com.gym.userservice.entity.MemberDetails;
import com.gym.userservice.entity.TrainerDetails;
import com.gym.userservice.entity.User;
import com.gym.userservice.exception.AccountDeactivatedException;
import com.gym.userservice.exception.BadRequestException;
import com.gym.userservice.exception.ResourceNotFoundException;
import com.gym.userservice.repository.MemberDetailsRepository;
import com.gym.userservice.repository.TrainerDetailsRepository;
import com.gym.userservice.feign.NotificationServiceClient;
import com.gym.userservice.repository.UserRepository;
import com.gym.userservice.service.IUserService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Predicate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class UserServiceImpl implements IUserService {

    private final UserRepository repo;
    private final TrainerDetailsRepository trainerRepo;
    private final MemberDetailsRepository memberRepo;
    private final PasswordEncoder encoder;
    private final NotificationServiceClient notificationClient;

    private static final Set<String> ALLOWED_SORT_COLUMNS = Set.of("id", "name", "email", "role", "createdAt");

    public UserServiceImpl(UserRepository repo,
                           TrainerDetailsRepository trainerRepo,
                           MemberDetailsRepository memberRepo,
                           PasswordEncoder encoder,
                           NotificationServiceClient notificationClient) {

        this.repo = repo;
        this.trainerRepo = trainerRepo;
        this.memberRepo = memberRepo;
        this.encoder = encoder;
        this.notificationClient = notificationClient;
    }

    // ============================================================
    // ADMIN REGISTER (RETURNS USER)
    // ============================================================
    @Override
    public User registerAdmin(AdminRegisterRequest request) {

        if (repo.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(encoder.encode(request.getPassword()));
        user.setRole("ROLE_ADMIN");

        User saved = repo.save(user);
        saved.setPassword(null);
        return saved;
    }

    // ============================================================
    // TRAINER REGISTER
    // ============================================================
    @Override
    public User registerTrainer(TrainerRegisterRequest request) {

        Optional<User> existingUser = repo.findByEmailIncludeDeleted(request.getEmail());
        if (existingUser.isPresent()) {
            if (existingUser.get().isDeleted()) {
                throw new AccountDeactivatedException("Account is deactivated. Please reactivate it.");
            } else {
                throw new BadRequestException("Email already exists");
            }
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(encoder.encode(request.getPassword()));
        user.setRole("ROLE_TRAINER");
        // Set dateOfBirth if provided
        if (request.getDateOfBirth() != null && !request.getDateOfBirth().isBlank()) {
            try {
                user.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()));
            } catch (Exception e) {
                throw new BadRequestException("Invalid dateOfBirth format. Use yyyy-MM-dd.");
            }
        }

        User savedUser = repo.save(user);

        TrainerDetails details = new TrainerDetails();
        details.setSpecialization(request.getSpecialization());
        details.setExperienceYears(request.getExperienceYears());
        details.setCertification(request.getCertification());
        details.setPhone(request.getPhone());
        details.setUser(savedUser);
        // Set dateOfBirth in TrainerDetails if provided
        if (request.getDateOfBirth() != null && !request.getDateOfBirth().isBlank()) {
            details.setDateOfBirth(request.getDateOfBirth());
        }

        trainerRepo.save(details);

        // Automated notification for new trainer registration
        String phone = details.getPhone();
        if (phone != null && !phone.isBlank()) {
            try {
                PromotionalNotificationRequest notification = new PromotionalNotificationRequest();
                notification.setTargetType(TargetType.SPECIFIC_PHONES);
                notification.setTargetIdentifiers(List.of(phone));
                // Use template loader for trainer registration notification
                String rendered = com.gym.userservice.common.TemplateUtil.renderTemplate(
                    "trainer_registration_notification.html",
                    Map.of("userName", user.getName() == null ? "" : user.getName())
                );
                if (rendered.isEmpty()) {
                    rendered = "Welcome, " + user.getName() + "! You have been registered as a trainer. Let's inspire our members together!";
                }
                notification.setMessageContent(rendered);
                notificationClient.sendNotification(notification);
            } catch (Exception e) {
                System.err.println("Failed to send registration notification to trainer: " + e.getMessage());
            }
        }

        savedUser.setPassword(null);
        return savedUser;
    }

    // ============================================================
    // MEMBER REGISTER
    // ============================================================
    @Override
    public User registerMember(MemberRegisterRequest request) {

        Optional<User> existingUser = repo.findByEmailIncludeDeleted(request.getEmail());
        if (existingUser.isPresent()) {
            if (existingUser.get().isDeleted()) {
                throw new AccountDeactivatedException("Account is deactivated. Please reactivate it.");
            } else {
                throw new BadRequestException("Email already exists");
            }
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(encoder.encode(request.getPassword()));
        user.setRole("ROLE_MEMBER");
        // Set dateOfBirth if provided
        if (request.getDateOfBirth() != null && !request.getDateOfBirth().isBlank()) {
            try {
                user.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()));
            } catch (Exception e) {
                throw new BadRequestException("Invalid dateOfBirth format. Use yyyy-MM-dd.");
            }
        }

        User savedUser = repo.save(user);

        MemberDetails details = new MemberDetails();
        details.setAge(request.getAge());
        details.setGender(request.getGender());
        details.setHeight(request.getHeight());
        details.setWeight(request.getWeight());
        details.setGoal(request.getGoal());
        details.setMembershipType(request.getMembershipType());
        details.setPhone(request.getPhone());
        details.setFingerprint(request.getFingerprint()); // Set fingerprint here
        details.setUser(savedUser);
        // Set dateOfBirth in MemberDetails as well
        details.setDateOfBirth(request.getDateOfBirth());

        savedUser.setMemberDetails(details);

        memberRepo.save(details);

        // Automated notification for new member registration
        String phone = details.getPhone();
        if (phone != null && !phone.isBlank()) {
            try {
                PromotionalNotificationRequest notification = new PromotionalNotificationRequest();
                notification.setTargetType(TargetType.SPECIFIC_PHONES);
                notification.setTargetIdentifiers(List.of(phone));
                // Use template loader for member registration notification
                String rendered = com.gym.userservice.common.TemplateUtil.renderTemplate(
                    "member_registration_notification.html",
                    Map.of("userName", user.getName() == null ? "" : user.getName())
                );
                if (rendered.isEmpty()) {
                    rendered = "Welcome, " + user.getName() + "! You have been registered as a member. Let's achieve your fitness goals together!";
                }
                notification.setMessageContent(rendered);
                notificationClient.sendNotification(notification);
            } catch (Exception e) {
                System.err.println("Failed to send registration notification to member: " + e.getMessage());
            }
        }

        savedUser.setPassword(null);
        return savedUser;
    }

    // ============================================================
    // GET EMAIL
    // ============================================================
    @Override
    public UserResponse getByEmail(String email) {
        User user = repo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.isDeleted()) {
            throw new ResourceNotFoundException("User is deleted");
        }

        return toUserResponse(user);
    }

    // ============================================================
    // GET BY ID
    // ============================================================
    @Override
    public UserResponse getById(Long id) {
        User user = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.isDeleted()) {
            throw new ResourceNotFoundException("User is deleted");
        }

        return toUserResponse(user);
    }

    @Override
    public boolean existsById(Long id) {
        return repo.existsById(id);
    }

    // ============================================================
    // LISTS (FILTER OUT DELETED)
    // ============================================================
    @Override
    public Page<UserResponse> getAllUsers(int page, int size, String sortBy, String sortDir, String search) {
        Pageable pageable = buildPageable(page, size, sortBy, sortDir);
        return repo.findAll(buildUserSpecification(null, search), pageable)
                .map(this::toUserResponse);
    }

    @Override
    public Page<User> getAllMembers(int page, int size, String sortBy, String sortDir, String search) {
        Pageable pageable = buildPageable(page, size, sortBy, sortDir);
        return repo.findAll(buildUserSpecification("ROLE_MEMBER", search), pageable)
                .map(this::clearPassword);
    }

    @Override
    public Page<User> getAllTrainers(int page, int size, String sortBy, String sortDir, String search) {
        Pageable pageable = buildPageable(page, size, sortBy, sortDir);
        return repo.findAll(buildUserSpecification("ROLE_TRAINER", search), pageable)
                .map(this::clearPassword);
    }

    @Override
    public Page<User> getAllMembersForAdmin(int page, int size, String sortBy, String sortDir, String search) {
        Pageable pageable = buildPageable(page, size, sortBy, sortDir);
        return repo.findAll(buildUserSpecification("ROLE_MEMBER", search), pageable)
                .map(this::clearPassword);
    }

    // ============================================================
    // SOFT DELETE USER
    // ============================================================
    @Override
    public void deleteUser(Long id) {
        User user = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setDeleted(true);

        if (user.getMemberDetails() != null) {
            user.getMemberDetails().setDeleted(true);
            memberRepo.save(user.getMemberDetails());
        }

        if (user.getTrainerDetails() != null) {
            user.getTrainerDetails().setDeleted(true);
            trainerRepo.save(user.getTrainerDetails());
        }

        repo.save(user);
    }

    // ============================================================
    // RESTORE USER (OPTIONAL)
    // ============================================================
    @Override
    public User restoreUser(Long id) {
        User user = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setDeleted(false);

        if (user.getMemberDetails() != null) {
            user.getMemberDetails().setDeleted(false);
            memberRepo.save(user.getMemberDetails());
        }

        if (user.getTrainerDetails() != null) {
            user.getTrainerDetails().setDeleted(false);
            trainerRepo.save(user.getTrainerDetails());
        }

        return repo.save(user);
    }

    @Override
    public User reactivateUser(String email) {
        User user = repo.findByEmailIncludeDeleted(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.isDeleted()) {
            throw new BadRequestException("User is not deactivated");
        }

        user.setDeleted(false);
        user.setDeletedAt(null);

        if (user.getMemberDetails() != null) {
            user.getMemberDetails().setDeleted(false);
            memberRepo.save(user.getMemberDetails());
        }

        if (user.getTrainerDetails() != null) {
            user.getTrainerDetails().setDeleted(false);
            trainerRepo.save(user.getTrainerDetails());
        }

        return repo.save(user);
    }

    // ============================================================
    // UPDATE USER
    // ============================================================
    @Override
    public User updateUser(Long id, Map<String, Object> updates) {
        User user = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isDeleted()) {
            throw new RuntimeException("Cannot update deleted user");
        }

        // COMMON FIELDS
        if (updates.containsKey("name")) user.setName((String) updates.get("name"));
        if (updates.containsKey("email")) {
            String newEmail = (String) updates.get("email");
            if (!newEmail.equals(user.getEmail())) {
                if (repo.existsByEmailAndIdNot(newEmail, id)) {
                    throw new BadRequestException("Email already exists");
                }
                user.setEmail(newEmail);
            }
        }
        // Handle dateOfBirth (update both User and MemberDetails)
        if (updates.containsKey("dateOfBirth")) {
            Object dobObj = updates.get("dateOfBirth");
            String dobStr = dobObj != null ? dobObj.toString() : null;
            if (dobStr != null && !dobStr.isBlank()) {
                try {
                    user.setDateOfBirth(java.time.LocalDate.parse(dobStr));
                } catch (Exception e) {
                    throw new BadRequestException("Invalid dateOfBirth format. Use yyyy-MM-dd.");
                }
            } else {
                user.setDateOfBirth(null);
            }
            if (user.getMemberDetails() != null) {
                user.getMemberDetails().setDateOfBirth(dobStr);
            }
        }

        // MEMBER
        if (user.getMemberDetails() != null) {
            var m = user.getMemberDetails();

            if (updates.containsKey("goal")) m.setGoal((String) updates.get("goal"));
            if (updates.containsKey("phone")) m.setPhone((String) updates.get("phone"));
            if (updates.containsKey("gender")) m.setGender((String) updates.get("gender"));
            if (updates.containsKey("age")) m.setAge((Integer) updates.get("age"));
            if (updates.containsKey("height")) m.setHeight(Double.valueOf(updates.get("height").toString()));
            if (updates.containsKey("weight")) m.setWeight(Double.valueOf(updates.get("weight").toString()));
            if (updates.containsKey("membershipType"))
                m.setMembershipType((String) updates.get("membershipType"));
        }

        // TRAINER
        if (user.getTrainerDetails() != null) {
            var t = user.getTrainerDetails();

            if (updates.containsKey("specialization")) t.setSpecialization((String) updates.get("specialization"));
            if (updates.containsKey("certification")) t.setCertification((String) updates.get("certification"));
            if (updates.containsKey("experienceYears"))
                t.setExperienceYears(Integer.valueOf(updates.get("experienceYears").toString()));
            if (updates.containsKey("phone")) t.setPhone((String) updates.get("phone"));
            // Update dateOfBirth in TrainerDetails if present
            if (updates.containsKey("dateOfBirth")) {
                Object dobObj = updates.get("dateOfBirth");
                String dobStr = dobObj != null ? dobObj.toString() : null;
                t.setDateOfBirth(dobStr);
            }
        }

        User updated = repo.save(user);
        updated.setPassword(null);
        return updated;
    }

    // ============================================================
    // STATS
    // ============================================================
    @Override
    public long countTotalMembers() {
        return repo.countTotalMembers();
    }

    @Override
    public long countMembersThisMonth() {
        LocalDate now = LocalDate.now();
        return repo.countMembersByMonthAndYear(now.getMonthValue(), now.getYear());
    }

    @Override
    public long countMembersLastMonth() {
        LocalDate prev = LocalDate.now().minusMonths(1);
        return repo.countMembersByMonthAndYear(prev.getMonthValue(), prev.getYear());
    }

    @Override
    public long countMembersByMonthAndYear(int month, int year) {
        if (month < 1 || month > 12) {
            throw new IllegalArgumentException("month must be between 1 and 12");
        }
        if (year < 1900) {
            throw new IllegalArgumentException("Invalid year");
        }

        return repo.countMembersByMonthAndYear(month, year);
    }

    // ============================================================
    // FINGERPRINT VERIFICATION
    // ============================================================
    @Override
    public boolean verifyFingerprint(String email, String fingerprint) {
        User user = repo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.isDeleted()) {
            throw new ResourceNotFoundException("User is deleted");
        }

        if (!"ROLE_MEMBER".equals(user.getRole())) {
            throw new BadRequestException("Fingerprint verification is only available for members.");
        }

        MemberDetails memberDetails = user.getMemberDetails();
        if (memberDetails == null || memberDetails.getFingerprint() == null || memberDetails.getFingerprint().isEmpty()) {
            throw new BadRequestException("No fingerprint registered for this member.");
        }

        // IMPORTANT: In a real application, this comparison would involve a sophisticated
        // biometric SDK or an external service to compare fingerprint templates,
        // accounting for variations and returning a confidence score.
        // For this example, we are using a simple string equality check.
        return memberDetails.getFingerprint().equals(fingerprint);
    }

    @Override
    public void sendPromotionalMessage(String message) {
        try {
            PromotionalNotificationRequest notification = new PromotionalNotificationRequest();
            notification.setTargetType(TargetType.ALL_USERS);
            // Use template loader for promotional message notification
            String rendered = com.gym.userservice.common.TemplateUtil.renderTemplate(
                "promotional_message_notification.html",
                Map.of("message", message == null ? "" : message)
            );
            if (rendered.isEmpty()) {
                rendered = message;
            }
            notification.setMessageContent(rendered);
            notificationClient.sendNotification(notification);
        } catch (Exception e) {
            System.err.println("Failed to send promotional message to all users: " + e.getMessage());
        }
    }

    private Pageable buildPageable(int page, int size, String sortBy, String sortDir) {
        int safePage = Math.max(page, 0);
        int safeSize = size <= 0 ? 10 : Math.min(size, 100);
        String property = ALLOWED_SORT_COLUMNS.contains(sortBy) ? sortBy : "createdAt";
        Sort sort = Sort.by(property);
        sort = "desc".equalsIgnoreCase(sortDir) ? sort.descending() : sort.ascending();
        return PageRequest.of(safePage, safeSize, sort);
    }

    private Specification<User> buildUserSpecification(String role, String search) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("deleted")));

            if (StringUtils.hasText(role)) {
                predicates.add(cb.equal(root.get("role"), role));
            }

            if (StringUtils.hasText(search)) {
                String like = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), like),
                        cb.like(cb.lower(root.get("email")), like),
                        cb.like(cb.lower(root.get("phoneNumber")), like)
                ));
            }

            query.distinct(true);
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private User clearPassword(User user) {
        user.setPassword(null);
        return user;
    }

    public UserResponse toUserResponse(User user) {
        UserResponse res = new UserResponse();
        res.setId(user.getId());
        res.setName(user.getName());
        res.setEmail(user.getEmail());
        res.setRole(user.getRole());


        if (user.getMemberDetails() != null) {
            var m = user.getMemberDetails();
            res.setPhone(m.getPhone());
            MemberDetailsResponse mdr = new MemberDetailsResponse();
            mdr.setId(m.getId());
            mdr.setAge(m.getAge());
            mdr.setGender(m.getGender());
            mdr.setHeight(m.getHeight());
            mdr.setWeight(m.getWeight());
            mdr.setGoal(m.getGoal());
            mdr.setMembershipType(m.getMembershipType());
            mdr.setPhone(m.getPhone());
            mdr.setFingerprint(m.getFingerprint());
            // Set DOB from MemberDetails if present, else from User
            if (m.getDateOfBirth() != null) {
                mdr.setDateOfBirth(m.getDateOfBirth());
            } else if (user.getDateOfBirth() != null) {
                mdr.setDateOfBirth(user.getDateOfBirth().toString());
            }
            res.setMemberDetails(mdr);
        }

        if (user.getTrainerDetails() != null) {
            var t = user.getTrainerDetails();
            res.setPhone(t.getPhone());
            TrainerDetailsResponse tdr = new TrainerDetailsResponse();
            tdr.setId(t.getId());
            tdr.setSpecialization(t.getSpecialization());
            tdr.setExperienceYears(t.getExperienceYears());
            tdr.setCertification(t.getCertification());
            tdr.setPhone(t.getPhone());
            tdr.setDeleted(t.isDeleted());
            tdr.setDeletedAt(t.getDeletedAt() != null ? t.getDeletedAt().toString() : null);
            // Set DOB from TrainerDetails if present, else from User entity
            if (t.getDateOfBirth() != null && !t.getDateOfBirth().isBlank()) {
                tdr.setDateOfBirth(t.getDateOfBirth());
            } else if (user.getDateOfBirth() != null) {
                tdr.setDateOfBirth(user.getDateOfBirth().toString());
            }
            res.setTrainerDetails(tdr);
        }

        // Set dateOfBirth as ISO string if present (top-level)
        if (user.getDateOfBirth() != null) {
            res.setDateOfBirth(user.getDateOfBirth().toString());
        }

        return res;
    }
}
