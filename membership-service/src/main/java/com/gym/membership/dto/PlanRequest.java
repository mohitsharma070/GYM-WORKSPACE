package com.gym.membership.dto;

public record PlanRequest(String name, String description, double price, int durationDays) {
}
