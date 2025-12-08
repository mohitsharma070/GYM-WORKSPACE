package com.gym.userservice.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "users")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @Email
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String role;   // ADMIN, TRAINER, MEMBER

    @Column(updatable = false)
    private LocalDate createdAt;

    // -------------------------
    // SOFT DELETE FIELDS
    // -------------------------
    @Column(nullable = false)
    private boolean deleted = false;

    private LocalDateTime deletedAt;   // NEW FIELD

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDate.now();
    }

    // -------------------------
    // RELATION WITH TRAINER DETAILS
    // -------------------------
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private TrainerDetails trainerDetails;

    // -------------------------
    // RELATION WITH MEMBER DETAILS
    // -------------------------
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private MemberDetails memberDetails;

    public User() {}

    // ------- GETTERS -------
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getRole() { return role; }

    public TrainerDetails getTrainerDetails() { return trainerDetails; }
    public MemberDetails getMemberDetails() { return memberDetails; }

    public boolean isDeleted() { return deleted; }
    public LocalDateTime getDeletedAt() { return deletedAt; }

    // ------- SETTERS -------
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setRole(String role) { this.role = role; }

    public void setDeleted(boolean deleted) { this.deleted = deleted; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }

    public void setTrainerDetails(TrainerDetails trainerDetails) {
        this.trainerDetails = trainerDetails;
    }

    public void setMemberDetails(MemberDetails memberDetails) {
        this.memberDetails = memberDetails;
    }
}
