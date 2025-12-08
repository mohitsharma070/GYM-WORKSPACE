package com.gym.userservice.dto;

public class MonthMemberStatsResponse {
    private long count;

    public MonthMemberStatsResponse() {}

    public MonthMemberStatsResponse(long count) {
        this.count = count;
    }

    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
}
