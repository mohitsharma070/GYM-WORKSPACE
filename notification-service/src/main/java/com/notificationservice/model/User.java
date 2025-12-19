package com.notificationservice.model;

import java.util.List;

public class User {
    private Long id;
    private String email; // Assuming email as username
    private String phoneNumber; // New field
    private String password; // Encoded password
    private List<String> roles; // List of roles (e.g., "ADMIN", "MEMBER")

    // Constructors
    public User() {
    }

    public User(Long id, String email, String phoneNumber, String password, List<String> roles) {
        this.id = id;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.password = password;
        this.roles = roles;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}
