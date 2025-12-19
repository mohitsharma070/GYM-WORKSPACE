package com.notificationservice.client;

import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class UserServiceClient {

    public List<String> getAllUserPhoneNumbers() {
        // Placeholder for calling user-service to get all user phone numbers
        return Arrays.asList("9876543210", "1234567890"); // Dummy data
    }

    public List<String> getPhoneNumbersByUserIds(List<String> userIds) {
        // Placeholder for calling user-service to get phone numbers by user IDs
        // For now, just return the userIds as phone numbers (assuming they are)
        return userIds;
    }
}
