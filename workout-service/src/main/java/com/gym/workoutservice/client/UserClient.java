package com.gym.workoutservice.client;

import com.gym.workoutservice.config.FeignDynamicAuthConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "user-service",
        url = "${user.service.url}",
        configuration = FeignDynamicAuthConfig.class
)
public interface UserClient {

    @GetMapping("/auth/user/{id}/exists")
    boolean userExists(@PathVariable("id") Long id);

    @GetMapping("/auth/user/{id}")
    UserResponse getUserById(@PathVariable("id") Long id);

    // DTO for UserResponse from User Service
    class UserResponse {
        public Long id;
        public String name;
        public String email;
        public String role; // e.g., ROLE_ADMIN, ROLE_TRAINER, ROLE_MEMBER
    }
}
