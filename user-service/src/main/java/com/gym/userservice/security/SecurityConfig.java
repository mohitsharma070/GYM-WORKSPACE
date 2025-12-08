package com.gym.userservice.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SecurityConfig {

    private final UserDetailsService userDetailsService;

    public SecurityConfig(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                // 🔥 CORS ENABLED FOR YOUR FRONTEND AT 5173
                .cors(Customizer.withDefaults())

                .authorizeHttpRequests(auth -> auth

                        // Allow OPTIONS for CORS preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ---------- PUBLIC ENDPOINTS ----------
                        .requestMatchers(
                                "/auth/admin/register",
                                "/auth/trainer/register",
                                "/auth/member/register",
                                "/auth/login",
                                "/auth/user/**"     // used by Membership Service Feign Client
                        ).permitAll()
                        .requestMatchers("/auth/member/reactivate").permitAll()

                        // ---------- AUTH REQUIRED ----------
                        .requestMatchers("/auth/me").authenticated()

                        // ---------- ROLE-BASED SECURED ----------
                        .requestMatchers("/auth/admin/**").hasRole("ADMIN")      // Maps to ROLE_ADMIN
                        .requestMatchers("/auth/trainer/**").hasRole("TRAINER")  // Maps to ROLE_TRAINER
                        .requestMatchers("/auth/member/**").hasRole("MEMBER")    // Maps to ROLE_MEMBER

                        .anyRequest().authenticated()
                )

                // Basic Authentication
                .httpBasic(Customizer.withDefaults())

                // 🔥 Use your custom UserDetailsService
                .userDetailsService(userDetailsService);

        return http.build();
    }

    // Password encoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Expose AuthenticationManager for future login endpoints
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
