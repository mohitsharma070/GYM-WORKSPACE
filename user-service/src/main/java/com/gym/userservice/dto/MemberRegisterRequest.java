package com.gym.userservice.dto;

public class MemberRegisterRequest {

    private String name;
    private String email;
    private String password;

    private int age;
    private String dateOfBirth; // Format: yyyy-MM-dd
    private String gender;
    private double height;
    private double weight;
    private String goal;
    private String membershipType;
    private String phone;
    private String fingerprint; // New field for fingerprint data

    public MemberRegisterRequest() {}

    // ---------------------
    // BASIC USER FIELDS
    // ---------------------
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    // ---------------------
    // MEMBER DETAIL FIELDS
    // ---------------------

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public double getHeight() { return height; }
    public void setHeight(double height) { this.height = height; }

    public double getWeight() { return weight; }
    public void setWeight(double weight) { this.weight = weight; }

    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }

    public String getMembershipType() { return membershipType; }
    public void setMembershipType(String membershipType) { this.membershipType = membershipType; }

    // ---------------------
    // PHONE NUMBER FIX
    // ---------------------
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getFingerprint() { return fingerprint; }
    public void setFingerprint(String fingerprint) { this.fingerprint = fingerprint; }
}
