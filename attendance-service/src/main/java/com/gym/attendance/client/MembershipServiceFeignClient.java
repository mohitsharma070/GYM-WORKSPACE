package com.gym.attendance.client;

import com.gym.attendance.payload.response.MembershipResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Optional;

@FeignClient(name = "membership-service", url = "${membership.service.url}")
public interface MembershipServiceFeignClient {

    @GetMapping("/api/memberships/{membershipId}")
    MembershipResponse getMembershipById(@PathVariable Long membershipId);

    @GetMapping("/api/memberships/{membershipId}/exists")
    Boolean membershipExists(@PathVariable Long membershipId);

    @GetMapping("/api/memberships/user/{userId}/active")
    Optional<MembershipResponse> findActiveMembershipByUserId(@PathVariable Long userId);
}
