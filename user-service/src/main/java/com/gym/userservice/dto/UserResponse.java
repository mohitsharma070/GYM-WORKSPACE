package com.gym.userservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String phone;
    private String dateOfBirth; // Top-level DOB
    private MemberDetailsResponse memberDetails; // Nested member details
    private TrainerDetailsResponse trainerDetails; // Nested trainer details

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setRole(String role) { this.role = role; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public MemberDetailsResponse getMemberDetails() { return memberDetails; }
    public void setMemberDetails(MemberDetailsResponse memberDetails) { this.memberDetails = memberDetails; }
    public TrainerDetailsResponse getTrainerDetails() { return trainerDetails; }
    public void setTrainerDetails(TrainerDetailsResponse trainerDetails) { this.trainerDetails = trainerDetails; }
}
