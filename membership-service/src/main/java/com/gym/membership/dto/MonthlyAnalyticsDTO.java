package com.gym.membership.dto;

public class MonthlyAnalyticsDTO {

    private int month;
    private int year;

    private double planRevenue;
    private double productRevenue;
    private double totalRevenue;

    private long membersThisMonth;

    public MonthlyAnalyticsDTO() {}

    public MonthlyAnalyticsDTO(
            int month,
            int year,
            double planRevenue,
            double productRevenue,
            long membersThisMonth
    ) {
        this.month = month;
        this.year = year;
        this.planRevenue = planRevenue;
        this.productRevenue = productRevenue;
        this.totalRevenue = planRevenue + productRevenue;
        this.membersThisMonth = membersThisMonth;
    }

    // GETTERS
    public int getMonth() {
        return month;
    }

    public int getYear() {
        return year;
    }

    public double getPlanRevenue() {
        return planRevenue;
    }

    public double getProductRevenue() {
        return productRevenue;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public long getMembersThisMonth() {
        return membersThisMonth;
    }
}
