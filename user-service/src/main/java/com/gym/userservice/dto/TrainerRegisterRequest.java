package com.gym.userservice.dto;

public class TrainerRegisterRequest {

    private String name;
    private String email;
    private String password;

    private String specialization;
    private int experienceYears;
    private String certification;
    private String phone;

    public TrainerRegisterRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public int getExperienceYears() { return experienceYears; }
    public void setExperienceYears(int experienceYears) { this.experienceYears = experienceYears; }

    public String getCertification() { return certification; }
    public void setCertification(String certification) { this.certification = certification; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
