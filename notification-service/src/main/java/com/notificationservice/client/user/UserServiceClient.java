package com.notificationservice.client.user;

import com.notificationservice.model.User;
import java.util.List;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "user-service", url = "${application.userservice.url:http://localhost:8080}") // user-service is the name of the service
public interface UserServiceClient {

    @GetMapping("/api/users/by-email") // Assuming an endpoint in user-service to fetch user by email
    User getUserByEmail(@RequestParam("email") String email);

    @GetMapping("/auth/admin/all")
    List<User> getAllUsers();

    @GetMapping("/auth/admin/members")
    List<User> getAllMembers();

    @GetMapping("/auth/admin/trainers")
    List<User> getAllTrainers();

    @GetMapping("/api/users/phone-numbers/all")
    List<String> getAllUserPhoneNumbers();

    @GetMapping("/api/users/phone-numbers/by-ids")
    List<String> getPhoneNumbersByUserIds(@RequestParam("userIds") List<String> userIds);
}
