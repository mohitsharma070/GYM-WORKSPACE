package com.gym.workoutservice.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignDynamicAuthConfig {

    @Bean
    public RequestInterceptor authForwardingInterceptor() {
        return (RequestTemplate template) -> {
            RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();

            if (!(requestAttributes instanceof ServletRequestAttributes attrs)) {
                return;
            }

            HttpServletRequest request = attrs.getRequest();
            if (request == null) return;

            String authHeader = request.getHeader("Authorization");

            if (authHeader != null && !authHeader.isBlank()) {
                template.header("Authorization", authHeader);
            }
        };
    }
}
