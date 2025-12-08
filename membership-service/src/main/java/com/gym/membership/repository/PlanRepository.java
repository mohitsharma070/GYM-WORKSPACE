package com.gym.membership.repository;

import com.gym.membership.entity.Plan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlanRepository extends JpaRepository<Plan, Long> { }
