package com.notificationservice.config;

import com.notificationservice.security.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    public SecurityConfig(CustomUserDetailsService customUserDetailsService) {
        // CustomUserDetailsService is still needed to enable method security expressions like hasRole()
        // even if httpBasic is removed. Spring Security uses it to resolve user details for expressions.
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        log.info("SecurityConfig loaded: custom security rules are active.");
            // Debug filter to log all incoming requests and their paths
            http.addFilterBefore(new jakarta.servlet.Filter() {
                @Override
                public void doFilter(jakarta.servlet.ServletRequest request, jakarta.servlet.ServletResponse response, jakarta.servlet.FilterChain chain)
                        throws java.io.IOException, jakarta.servlet.ServletException {
                    jakarta.servlet.http.HttpServletRequest req = (jakarta.servlet.http.HttpServletRequest) request;
                    log.info("Incoming request: {} {}", req.getMethod(), req.getRequestURI());
                    chain.doFilter(request, response);
                }
            }, org.springframework.security.web.authentication.AnonymousAuthenticationFilter.class);
        http
            .cors(cors -> cors.disable())
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authorize -> authorize
                .anyRequest().permitAll()
            );
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

