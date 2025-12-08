package com.gym.membership.client;

import com.gym.membership.config.FeignDynamicAuthConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "user-service",
        url = "${user.service.url}",
        configuration = FeignDynamicAuthConfig.class
)
public interface UserClient {

    // ===========================================================
    // USER DETAILS
    // ===========================================================

    @GetMapping("/auth/user/{id}")
    UserResponse getUserById(@PathVariable("id") Long id);

    @GetMapping("/auth/user/{id}/exists")
    boolean userExists(@PathVariable("id") Long id);


    // ===========================================================
    // DEFAULT MEMBER STATS (TOTAL, THIS-MONTH, LAST-MONTH)
    // ===========================================================

    @GetMapping("/auth/stats/members")
    MemberStatsResponse getMemberStats();


    // ===========================================================
    // DYNAMIC MONTH/YEAR STATS (REQUIRED FOR DYNAMIC ANALYTICS)
    // ===========================================================

    @GetMapping("/auth/stats/members/{year}/{month}")
    MonthMemberStats getMemberStatsForMonth(
            @PathVariable("year") int year,
            @PathVariable("month") int month
    );

    @PostMapping("/auth/stats/members/batch-by-month")
    List<MonthMemberStats> getMemberStatsForMonths(List<MonthYearPair> monthYearPairs);


    // ===========================================================
    // DTO CLASSES
    // ===========================================================

    class UserResponse {
        public Long id;
        public String name;
        public String email;
        public String role;
    }

    // Matches JSON returned from /auth/stats/members
    public class MemberStatsResponse {
        public long totalMembers;
        public long membersThisMonth;
        public long membersLastMonth;
    }

    // Matches JSON returned from /auth/stats/members/{year}/{month}
    // Example: { "count": 5 }
    public class MonthMemberStats {
        public long count;
        public int month;
        public int year;

        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
        public int getMonth() { return month; }
        public void setMonth(int month) { this.month = month; }
        public int getYear() { return year; }
        public void setYear(int year) { this.year = year; }
    }

    // DTO for batching month/year requests
    public class MonthYearPair {
        public int month;
        public int year;

        public MonthYearPair(int month, int year) {
            this.month = month;
            this.year = year;
        }
    }

}
