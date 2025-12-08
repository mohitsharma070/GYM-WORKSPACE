package com.gym.attendance.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MembershipResponse {
    private Long id;
    private Long userId;
    // Add other fields if necessary for other Feign client calls
}
