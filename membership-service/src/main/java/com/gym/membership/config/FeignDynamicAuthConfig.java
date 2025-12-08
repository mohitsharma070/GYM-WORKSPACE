package com.gym.membership.config;

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
            // Get request attributes safely
            RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();

            if (!(requestAttributes instanceof ServletRequestAttributes attrs)) {
                return; // No active HTTP request (e.g., async threads)
            }

            HttpServletRequest request = attrs.getRequest();
            if (request == null) return;

            // Extract Authorization header
            String authHeader = request.getHeader("Authorization");

            // Forward only if present & non-empty
            if (authHeader != null && !authHeader.isBlank()) {
                template.header("Authorization", authHeader);
            }
        };
    }
}
