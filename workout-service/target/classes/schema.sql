-- SQL Schema for Workout Service

-- 1. Exercise Catalog
CREATE TABLE exercise_catalog (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    body_part VARCHAR(50) NOT NULL, -- Chest, Back, Legs, Arms, Shoulders, Core, Full Body
    equipment VARCHAR(100) NOT NULL, -- Dumbbell, Machine, Cable, Bodyweight, etc.
    difficulty VARCHAR(20) NOT NULL, -- BEGINNER, INTERMEDIATE, ADVANCED
    video_url VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common lookups
CREATE INDEX idx_exercise_name ON exercise_catalog (name);
CREATE INDEX idx_exercise_body_part ON exercise_catalog (body_part);
CREATE INDEX idx_exercise_difficulty ON exercise_catalog (difficulty);


-- 2. Workout Plan
CREATE TABLE workout_plan (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty VARCHAR(20) NOT NULL, -- BEGINNER, INTERMEDIATE, ADVANCED
    created_by_trainer_id BIGINT, -- Assuming Trainer ID from User Service
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common lookups
CREATE INDEX idx_workout_plan_name ON workout_plan (name);
CREATE INDEX idx_workout_plan_difficulty ON workout_plan (difficulty);
CREATE INDEX idx_workout_plan_trainer ON workout_plan (created_by_trainer_id);


-- 3. Workout Day
CREATE TABLE workout_day (
    id BIGSERIAL PRIMARY KEY,
    plan_id BIGINT NOT NULL REFERENCES workout_plan(id) ON DELETE CASCADE,
    day_number INT NOT NULL, -- e.g., 1 for Monday, 2 for Tuesday, up to 7
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(plan_id, day_number) -- A plan should have only one day_number
);

-- Indexes for common lookups
CREATE INDEX idx_workout_day_plan_id ON workout_day (plan_id);


-- 4. Workout Exercise
CREATE TABLE workout_exercise (
    id BIGSERIAL PRIMARY KEY,
    workout_day_id BIGINT NOT NULL REFERENCES workout_day(id) ON DELETE CASCADE,
    exercise_id BIGINT NOT NULL REFERENCES exercise_catalog(id) ON DELETE RESTRICT, -- Don't delete exercise if part of a plan
    sets INT NOT NULL,
    reps VARCHAR(50) NOT NULL, -- Can be '8-12', '10', 'Max'
    rest_time_in_seconds INT,
    order_in_day INT NOT NULL, -- Order of exercise within the day
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workout_day_id, exercise_id) -- An exercise should only be once in a workout day
);

-- Indexes for common lookups
CREATE INDEX idx_workout_exercise_day_id ON workout_exercise (workout_day_id);
CREATE INDEX idx_workout_exercise_exercise_id ON workout_exercise (exercise_id);


-- 5. Assigned Workout Plan
CREATE TABLE assigned_workout_plan (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL, -- Member ID from User Service
    plan_id BIGINT NOT NULL REFERENCES workout_plan(id) ON DELETE RESTRICT, -- Don't delete plan if assigned
    assigned_by_trainer_id BIGINT, -- Trainer ID from User Service
    start_date DATE NOT NULL,
    end_date DATE, -- Optional, can be null for ongoing plans
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, CANCELLED
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, plan_id, start_date) -- A member can be assigned a plan from a specific start date once
);

-- Indexes for common lookups
CREATE INDEX idx_assigned_plan_member_id ON assigned_workout_plan (member_id);
CREATE INDEX idx_assigned_plan_plan_id ON assigned_workout_plan (plan_id);
CREATE INDEX idx_assigned_plan_status ON assigned_workout_plan (status);


-- 6. Workout Log
CREATE TABLE workout_log (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL, -- Member ID from User Service
    exercise_id BIGINT NOT NULL REFERENCES exercise_catalog(id) ON DELETE RESTRICT,
    log_date DATE NOT NULL,
    actual_sets INT,
    actual_reps VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common lookups
CREATE INDEX idx_workout_log_member_id ON workout_log (member_id);
CREATE INDEX idx_workout_log_exercise_id ON workout_log (exercise_id);
CREATE INDEX idx_workout_log_date ON workout_log (log_date);
