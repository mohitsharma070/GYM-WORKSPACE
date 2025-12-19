package com.notificationservice.security;

import com.notificationservice.client.user.UserServiceClient;
import com.notificationservice.model.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserServiceClient userServiceClient;

    public CustomUserDetailsService(UserServiceClient userServiceClient) {
        this.userServiceClient = userServiceClient;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Call user-service to get user details
        User user = userServiceClient.getUserByEmail(username);

        if (user == null) {
            throw new UsernameNotFoundException("User not found with email: " + username);
        }

        // Convert custom User roles to Spring Security GrantedAuthorities
        List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role)) // Prefix roles with "ROLE_"
                .collect(Collectors.toList());

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }
}
