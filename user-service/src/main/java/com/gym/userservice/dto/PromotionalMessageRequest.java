package com.gym.userservice.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PromotionalMessageRequest {
    private String message;

    public String getMessage() {
        return this.message;
    }
}
