package com.gym.membership.dto;

public class AnalyticsResponse {

    // PERIOD (for dynamic analytics)
    private int month;     // e.g., 3 = March
    private int year;      // e.g., 2024

    // REVENUE METRICS (DYNAMIC MONTH)
    private double planRevenue;
    private double productRevenue;
    private double totalRevenue;

    // PRODUCT SALES METRICS (DYNAMIC MONTH)
    private long productsSoldThisMonth;

    // MEMBER METRICS (DYNAMIC MONTH)
    private long membersThisMonth;
    private long membersLastMonth;

    // ALL-TIME METRICS
    private long totalMembers;
    private long totalProductsSold;

    // Default constructor (required by Jackson)
    public AnalyticsResponse() {}

    public AnalyticsResponse(
            int month,
            int year,
            double planRevenue,
            double productRevenue,
            long productsSoldThisMonth,
            long membersThisMonth,
            long membersLastMonth,
            long totalMembers,
            long totalProductsSold
    ) {
        this.month = month;
        this.year = year;

        this.planRevenue = planRevenue;
        this.productRevenue = productRevenue;
        this.totalRevenue = planRevenue + productRevenue;

        this.productsSoldThisMonth = productsSoldThisMonth;

        this.membersThisMonth = membersThisMonth;
        this.membersLastMonth = membersLastMonth;

        this.totalMembers = totalMembers;
        this.totalProductsSold = totalProductsSold;
    }

    // GETTERS
    public int getMonth() { return month; }
    public int getYear() { return year; }

    public double getPlanRevenue() { return planRevenue; }
    public double getProductRevenue() { return productRevenue; }
    public double getTotalRevenue() { return totalRevenue; }

    public long getProductsSoldThisMonth() { return productsSoldThisMonth; }

    public long getMembersThisMonth() { return membersThisMonth; }
    public long getMembersLastMonth() { return membersLastMonth; }

    public long getTotalMembers() { return totalMembers; }
    public long getTotalProductsSold() { return totalProductsSold; }
}
