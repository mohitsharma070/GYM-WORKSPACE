package com.gym.workoutservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "exercise_catalog")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Exercise {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "body_part", nullable = false)
    private BodyPart bodyPart;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Equipment equipment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    @Column(name = "video_url")
    private String videoUrl;

    private String description;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Enums for BodyPart, Equipment, Difficulty
    public enum BodyPart {
        CHEST, BACK, LEGS, ARMS, SHOULDERS, CORE, FULL_BODY
    }

    public enum Equipment {
        DUMBBELL, MACHINE, CABLE, BODYWEIGHT, BARBELL, KETTLEBELL, RESISTANCE_BAND, OTHER
    }

    public enum Difficulty {
        BEGINNER, INTERMEDIATE, ADVANCED
    }
}
