# Workout Service

This microservice is responsible for managing all aspects related to fitness workouts within the FitHub ecosystem, including an exercise catalog, workout plans, assignment of plans to members, and daily workout logging.

## Features

-   **Exercise Catalog**: Manage a comprehensive list of exercises with details like body part, equipment, difficulty, and optional video/description.
-   **Workout Plan System**: Create flexible workout plans composed of multiple days, where each day contains a specific set of exercises with sets, reps, and rest times.
-   **Workout Plan Assignment**: Assign workout plans to individual members, track their start/end dates, and manage their status (active, completed, cancelled).
-   **Daily Workout Logging**: Allow members to log their actual performance (sets, reps) for exercises on a given date, along with personal notes.

## Technologies Used

-   **Java 21**
-   **Spring Boot 3.x**: Framework for building the microservice.
-   **Spring Data JPA**: For data access and persistence.
-   **PostgreSQL**: Relational database for storing workout data.
-   **Lombok**: Reduces boilerplate code (getters, setters, constructors).
-   **Spring Validation**: For declarative validation of API requests.
-   **SpringDoc OpenAPI**: For automatic generation of API documentation (Swagger UI).
-   **Maven**: Build automation tool.

## Setup Instructions

1.  **Prerequisites**:
    *   Java Development Kit (JDK) 21 installed.
    *   Maven installed.
    *   PostgreSQL database server running.
    *   Create a PostgreSQL database named `gym_workout`.

2.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd workout-service
    ```

3.  **Database Configuration**:
    Update `src/main/resources/application.properties` with your PostgreSQL database credentials if they differ from the defaults:
    ```properties
    spring.datasource.url=jdbc:***REMOVED***ql://localhost:5432/gym_workout
    spring.datasource.username=***REMOVED***
    spring.datasource.password=***REMOVED***
    ```
    **Note**: For production environments, sensitive credentials should be managed securely (e.g., environment variables, Kubernetes secrets). Also, `spring.jpa.hibernate.ddl-auto` should be set to `none` or `validate` with a proper migration tool.

4.  **Build the Project**:
    ```bash
    mvn clean install
    ```

5.  **Run the Application**:
    ```bash
    mvn spring-boot:run
    ```
    The service will start on `http://localhost:8004`.

## Database Schema (SQL)

The following tables are created in the PostgreSQL database:

```sql
-- SQL Schema for Workout Service

-- 1. Exercise Catalog
CREATE TABLE exercise_catalog (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    body_part VARCHAR(50) NOT NULL,
    equipment VARCHAR(100) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    video_url VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_exercise_name ON exercise_catalog (name);
CREATE INDEX idx_exercise_body_part ON exercise_catalog (body_part);
CREATE INDEX idx_exercise_difficulty ON exercise_catalog (difficulty);


-- 2. Workout Plan
CREATE TABLE workout_plan (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty VARCHAR(20) NOT NULL,
    created_by_trainer_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_workout_plan_name ON workout_plan (name);
CREATE INDEX idx_workout_plan_difficulty ON workout_plan (difficulty);
CREATE INDEX idx_workout_plan_trainer ON workout_plan (created_by_trainer_id);


-- 3. Workout Day
CREATE TABLE workout_day (
    id BIGSERIAL PRIMARY KEY,
    plan_id BIGINT NOT NULL REFERENCES workout_plan(id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(plan_id, day_number)
);
CREATE INDEX idx_workout_day_plan_id ON workout_day (plan_id);


-- 4. Workout Exercise
CREATE TABLE workout_exercise (
    id BIGSERIAL PRIMARY KEY,
    workout_day_id BIGINT NOT NULL REFERENCES workout_day(id) ON DELETE CASCADE,
    exercise_id BIGINT NOT NULL REFERENCES exercise_catalog(id) ON DELETE RESTRICT,
    sets INT NOT NULL,
    reps VARCHAR(50) NOT NULL,
    rest_time_in_seconds INT,
    order_in_day INT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workout_day_id, exercise_id)
);
CREATE INDEX idx_workout_exercise_day_id ON workout_exercise (workout_day_id);
CREATE INDEX idx_workout_exercise_exercise_id ON workout_exercise (exercise_id);


-- 5. Assigned Workout Plan
CREATE TABLE assigned_workout_plan (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL,
    plan_id BIGINT NOT NULL REFERENCES workout_plan(id) ON DELETE RESTRICT,
    assigned_by_trainer_id BIGINT,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, plan_id, start_date)
);
CREATE INDEX idx_assigned_plan_member_id ON assigned_workout_plan (member_id);
CREATE INDEX idx_assigned_plan_plan_id ON assigned_workout_plan (plan_id);
CREATE INDEX idx_assigned_plan_status ON assigned_workout_plan (status);


-- 6. Workout Log
CREATE TABLE workout_log (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL REFERENCES exercise_catalog(id) ON DELETE RESTRICT,
    log_date DATE NOT NULL,
    actual_sets INT,
    actual_reps VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_workout_log_member_id ON workout_log (member_id);
CREATE INDEX idx_workout_log_exercise_id ON workout_log (exercise_id);
CREATE INDEX idx_workout_log_date ON workout_log (log_date);
```

## API Endpoints (Swagger UI)

Access the API documentation and test endpoints via Swagger UI: `http://localhost:8004/swagger-ui.html`

### Exercise APIs

-   `POST /workout/exercises`: Add a new exercise.
-   `GET /workout/exercises`: Get all exercises.
-   `GET /workout/exercises/{id}`: Get an exercise by ID.
-   `PUT /workout/exercises/{id}`: Update an existing exercise.
-   `DELETE /workout/exercises/{id}`: Delete an exercise.

### Workout Plan APIs

-   `POST /workout/plans`: Create a new workout plan.
-   `GET /workout/plans`: Get all workout plans. (Supports filtering by `trainerId` or `difficulty`)
-   `GET /workout/plans/{id}`: Get a workout plan by ID (full plan with days and exercises).
-   `PUT /workout/plans/{id}`: Update an existing workout plan.
-   `DELETE /workout/plans/{id}`: Delete a workout plan.
-   `POST /workout/plans/{planId}/days`: Add a workout day to a plan.
-   `PUT /workout/plans/{planId}/days/{dayId}`: Update a workout day within a plan.
-   `DELETE /workout/plans/{planId}/days/{dayId}`: Delete a workout day from a plan.
-   `GET /workout/plans/{planId}/days`: Get all workout days for a specific plan.
-   `POST /workout/plans/{planId}/days/{dayId}/exercises`: Add an exercise to a workout day.
-   `PUT /workout/plans/{planId}/days/{dayId}/exercises/{exerciseId}`: Update an exercise in a workout day.
-   `DELETE /workout/plans/{planId}/days/{dayId}/exercises/{exerciseId}`: Remove an exercise from a workout day.

### Assignment APIs

-   `POST /workout/assign`: Assign a workout plan to a member.
-   `PUT /workout/assign/{id}`: Update an assigned workout plan.
-   `PUT /workout/assign/{id}/cancel`: Cancel an assigned workout plan.
-   `GET /workout/assign/{id}`: Get an assigned workout plan by ID.
-   `GET /workout/assign/member/{memberId}`: Get all assigned workout plans for a member.
-   `GET /workout/assign/member/{memberId}/current-plan`: Get the current active plan for a member.
-   `GET /workout/assign/trainer/{trainerId}`: Get all assigned workout plans by a specific trainer.
-   `DELETE /workout/assign/{id}`: Delete an assigned workout plan (admin use).

### Workout Log APIs

-   `POST /workout/logs`: Submit a new workout log.
-   `PUT /workout/logs/{id}`: Update an existing workout log.
-   `GET /workout/logs/{id}`: Get a workout log by ID.
-   `GET /workout/logs/member/{memberId}`: Get all workout logs for a specific member.
-   `DELETE /workout/logs/{id}`: Delete a workout log.

## Clean Architecture Layers

The project is structured following clean architecture principles:

-   **`controller`**: Handles incoming HTTP requests and delegates to services. Responsible for API endpoint definitions and input validation.
-   **`service`**: Contains the core business logic. Interfaces (`I...Service`) define contracts, and implementations (`...ServiceImpl`) encapsulate the business rules and coordinate with repositories.
-   **`repository`**: Provides data access mechanisms, abstracting the database. Extends Spring Data JPA interfaces.
-   **`entity`**: JPA entities representing the database schema.
-   **`dto`**: Data Transfer Objects used for communication between API layers (request/response payloads).
-   **`exception`**: Custom exceptions and a global exception handler for consistent error responses.

## Logging

Standard Spring Boot logging is enabled by default. You can configure logging levels in `application.properties`.

## UML Diagrams

(Note: UML diagrams cannot be directly generated in text. Below is a textual representation of the relationships and flow.)

### Class Diagram (Textual Representation)

```
+----------------+       1..* +----------------+       1..* +-------------------+
| Exercise       |<----------| WorkoutExercise|<----------| WorkoutDay        |
| - id           |           | - id             |           | - id              |
| - name         |           | - sets           |           | - planId          |
| - bodyPart     |           | - reps           |           | - dayNumber       |
| - equipment    |           | - restTime       |           | - notes           |
| - difficulty   |           | - orderInDay     |           |                   |
| - videoUrl     |           | - workoutDay     |           | - workoutPlan     |
| - description  |           | - exercise       |           |                   |
+----------------+       1   +-------------------+       1  +-------------------+
       ^                               ^                               ^
       |                               |                               |
       |                               | 1..*                          | 1
       |                               |                               |
       |-------------------------------|-------------------------------|
       |                               |                               |
       |                               |                               |
       |                               |                               |
+----------------+       1..* +----------------+       1    +----------------+
| WorkoutLog     |<----------| AssignedWorkout|<----------| WorkoutPlan    |
| - id           |           |   Plan         |            | - id           |
| - memberId     |           | - id             |            | - name         |
| - exercise     |           | - memberId       |            | - description  |
| - logDate      |           | - planId         |            | - difficulty   |
| - actualSets   |           | - assignedByTrId |            | - createdByTrId|
| - actualReps   |           | - startDate      |            | - isActive     |
| - notes        |           | - endDate        |            |                |
+----------------+           | - status         |            |                |
                             +----------------+            +----------------+
```
*(This is a simplified representation. Actual diagram would show all fields and specific relationships like `@ManyToOne`, `@OneToMany` explicitly)*

### Flow Diagram for "Create Workout Plan" (Textual Representation)

```
[Client]
   |
   | HTTP POST /workout/plans with WorkoutPlanRequest (JSON)
   V
[WorkoutPlanController]
   | - Validates WorkoutPlanRequest
   | - Calls workoutPlanService.createWorkoutPlan(request)
   V
[WorkoutPlanServiceImpl (IWorkoutPlanService)]
   | - Checks for existing plan name (ConflictException)
   | - Maps WorkoutPlanRequest to WorkoutPlan Entity
   | - Calls workoutPlanRepository.save(workoutPlan)
   | - Maps saved WorkoutPlan Entity to WorkoutPlanResponse
   V
[WorkoutPlanController]
   | - Returns ResponseEntity<WorkoutPlanResponse> (201 Created)
   V
[Client]
```

---
This concludes the generation of the "Workout Service" microservice project structure and initial code. Please let me know if you would like to proceed with any specific refactoring tasks based on the previous analysis or if you have any other requests.
