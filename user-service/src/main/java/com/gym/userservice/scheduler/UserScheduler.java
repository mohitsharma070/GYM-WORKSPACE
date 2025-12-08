package com.gym.userservice.scheduler;

import com.gym.userservice.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class UserScheduler {

    private final UserRepository repo;

    public UserScheduler(UserRepository repo) {
        this.repo = repo;
    }

    @Scheduled(fixedRate = 60000) // runs every 1 minute
    public void checkUsers() {
        System.out.println("Total Users: " + repo.count());
    }
}
