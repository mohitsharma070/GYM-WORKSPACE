package com.notificationservice.config;

import com.notificationservice.security.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.Customizer;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    public SecurityConfig(CustomUserDetailsService customUserDetailsService) {
        // CustomUserDetailsService is still needed to enable method security expressions like hasRole()
        // even if httpBasic is removed. Spring Security uses it to resolve user details for expressions.
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(request -> {
                var corsConfiguration = new org.springframework.web.cors.CorsConfiguration();
                corsConfiguration.setAllowedOrigins(java.util.List.of("http://localhost:5173")); // Allow frontend origin
                corsConfiguration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                corsConfiguration.setAllowedHeaders(java.util.List.of("*"));
                corsConfiguration.setAllowCredentials(true);
                return corsConfiguration;
            }))
            .csrf(csrf -> csrf.disable()) // Disable CSRF for simplicity in API services
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/api/auth/**").permitAll() // Public endpoints, e.g., login, registration from user-service
                .requestMatchers("/api/promotional-notifications").hasRole("ADMIN") // Admin endpoints for promotional notifications
                .requestMatchers("/api/promotional-notifications/logs").hasRole("ADMIN") // Admin endpoints for promotional notifications history
                .requestMatchers("/api/images/upload").hasRole("ADMIN") // Admin endpoints for image upload
                .requestMatchers("/api/admin/**").hasRole("ADMIN") // Admin endpoints require ADMIN role
                .requestMatchers("/api/trainer/**").hasRole("TRAINER") // Trainer endpoints require TRAINER role
                .requestMatchers("/api/member/**").hasRole("MEMBER") // Member endpoints require MEMBER role
                .anyRequest().authenticated() // All other requests require authentication
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Use stateless sessions for REST APIs
            .httpBasic(Customizer.withDefaults()); // Enable Basic Authentication

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

