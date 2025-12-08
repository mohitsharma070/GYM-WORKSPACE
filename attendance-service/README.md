# Attendance Service

## Introduction
The `attendance-service` is a new microservice designed to manage the check-in and check-out records of gym members and trainers. It integrates with the existing User Service and Membership Service to validate user and membership information during attendance operations.

## Purpose
The primary responsibilities of this service include:
*   Recording member/trainer check-ins.
*   Recording member/trainer check-outs.
*   Storing attendance logs.
*   Providing attendance records for individual users or all records.
*   (Optional) Support for fingerprint verification during check-in.

## Technologies Used
*   **Spring Boot:** Framework for building standalone, production-grade Spring applications.
*   **Java 21:** The programming language version used.
*   **Maven:** Dependency management and build automation.
*   **Spring Data JPA:** For interacting with the PostgreSQL database.
*   **Lombok:** Reduces boilerplate code (getters, setters, constructors).
*   **Spring Web:** For building RESTful APIs.
*   **Spring Cloud OpenFeign:** Declarative REST client for inter-service communication.
*   **PostgreSQL:** Relational database for storing attendance records.

## Configuration (`application.properties`)
The service is configured via `src/main/resources/application.properties`:

```properties
spring.application.name=attendance-service
server.port=8003

# ============================
# DATABASE CONFIG (POSTGRES)
# ============================
spring.datasource.url=jdbc:***REMOVED***ql://localhost:5432/gym_attendance
spring.datasource.username=***REMOVED***
spring.datasource.password=***REMOVED***
spring.datasource.driver-class-name=org.***REMOVED***ql.Driver

# JPA / HIBERNATE
spring.jpa.hibernate.ddl-auto=update # Creates/updates database schema automatically
spring.jpa.show-sql=true             # Shows SQL statements in logs
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# ============================
# FEIGN CLIENTS (for inter-service communication)
# ============================
user.service.url=http://localhost:8001
membership.service.url=http://localhost:8002

# ============================
# SCHEDULER SETTINGS (Optional)
# ============================
# scheduler.daily-check.cron=0 0 2 * * *
```

## Entities

### `Attendance` (`com.gym.attendance.entity.Attendance`)
Represents an attendance record, detailing check-in/out times for a user and their membership.

| Field                 | Type           | Description                                       |
| :-------------------- | :------------- | :------------------------------------------------ |
| `id`                  | `Long`         | Unique identifier for the attendance record.      |
| `userId`              | `Long`         | ID of the user (from User Service).               |
| `membershipId`        | `Long`         | ID of the membership (from Membership Service).   |
| `checkInTime`         | `LocalDateTime`| Timestamp of when the user checked in.            |
| `checkOutTime`        | `LocalDateTime`| Timestamp of when the user checked out (nullable).|
| `status`              | `Enum` (`String`)| Current status of the attendance (PRESENT, ABSENT, PENDING). |
| `fingerprintVerified` | `Boolean`      | Indicates if fingerprint verification was used.   |

## API Endpoints (`AttendanceController`)

All endpoints are prefixed with `/api/attendances`.

### `POST /api/attendances/check-in`
Records a user's check-in. Validates `userId` and `membershipId` against respective services.
*   **Request Params:**
    *   `userId` (Long, required): The ID of the user checking in.
    *   `membershipId` (Long, required): The ID of the user's membership.
    *   `fingerprintVerified` (Boolean, optional): True if fingerprint verification was successful.
*   **Response:** `Attendance` object with HTTP Status `201 Created`.

### `POST /api/attendances/check-out/{attendanceId}`
Records a user's check-out for a given attendance record.
*   **Path Variable:**
    *   `attendanceId` (Long): The ID of the attendance record to update.
*   **Response:** Updated `Attendance` object with HTTP Status `200 OK`.
*   **Errors:** `400 Bad Request` if already checked out or `404 Not Found`.

### `GET /api/attendances`
Retrieves all attendance records.
*   **Response:** List of `Attendance` objects with HTTP Status `200 OK`.

### `GET /api/attendances/{id}`
Retrieves a specific attendance record by its ID.
*   **Path Variable:**
    *   `id` (Long): The ID of the attendance record.
*   **Response:** `Attendance` object with HTTP Status `200 OK` or `404 Not Found`.

### `GET /api/attendances/user/{userId}`
Retrieves all attendance records for a specific user.
*   **Path Variable:**
    *   `userId` (Long): The ID of the user.
*   **Response:** List of `Attendance` objects with HTTP Status `200 OK`.

## Inter-Service Communication (Feign Clients)

The Attendance Service communicates with other microservices using Feign clients:

### `UserServiceFeignClient` (`com.gym.attendance.client.UserServiceFeignClient`)
Connects to the User Service (`user.service.url`).
*   `GET /api/users/{userId}`: Retrieves a `UserResponse` by user ID.
*   `GET /api/users/{userId}/exists`: Checks if a user with the given ID exists. This endpoint is crucial for validating `userId` during check-in. **(Requires implementation in User Service)**

### `MembershipServiceFeignClient` (`com.gym.attendance.client.MembershipServiceFeignClient`)
Connects to the Membership Service (`membership.service.url`).
*   `GET /api/memberships/{membershipId}`: Retrieves a `MembershipResponse` by membership ID.
*   `GET /api/memberships/{membershipId}/exists`: Checks if a membership with the given ID exists. This endpoint is crucial for validating `membershipId` during check-in. **(Requires implementation in Membership Service)**

## Getting Started

To run the Attendance Service:

1.  **Prerequisites:**
    *   Java 21 installed.
    *   Maven installed.
    *   A PostgreSQL database running (e.g., on `localhost:5432`) with a database named `gym_attendance`.
    *   Ensure `user-service` and `membership-service` are running on their configured ports (`8001` and `8002` respectively), and that they expose the `/exists` endpoints for user and membership validation.
2.  **Build:** Navigate to the `attendance-service` directory and run:
    ```bash
    mvn clean install
    ```
3.  **Run:** After building, you can run the JAR file:
    ```bash
    java -jar target/attendance-service-0.0.1-SNAPSHOT.jar
    ```
    Alternatively, you can run it directly from Maven:
    ```bash
    mvn spring-boot:run
    ```

The service will start on `http://localhost:8003`.

## Future Considerations
*   Implement robust error handling and exception management.
*   Add integration with a real fingerprint verification system if required.
*   Enhance security with Spring Security.
*   Implement comprehensive unit and integration tests.
*   Consider implementing a Kafka/RabbitMQ producer/consumer for asynchronous attendance events.
