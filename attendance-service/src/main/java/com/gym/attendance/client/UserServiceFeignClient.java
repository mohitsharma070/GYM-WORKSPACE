package com.gym.attendance.client;

import com.gym.attendance.payload.response.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "user-service", url = "${user.service.url}")
public interface UserServiceFeignClient {

    @GetMapping("/auth/user/{userId}")
    UserResponse getUserById(@PathVariable("userId") Long userId);

    @GetMapping("/auth/user/{userId}/exists")
    Boolean userExists(@PathVariable("userId") Long userId);

    @PostMapping("/auth/member/verify-fingerprint")
    UserResponse verifyFingerprint(@RequestBody Map<String, String> request);
}
