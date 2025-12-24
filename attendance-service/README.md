
# Attendance Service

## Overview

The **Attendance Service** is a Spring Boot microservice for managing gym member and trainer attendance, including check-in, check-out, and fingerprint-based authentication. It integrates with user, membership, and notification services to provide a seamless attendance tracking experience.

---

## Key Features

- **Check-in/Check-out:** Records when a user enters or leaves the gym. Validates active membership and user existence via Feign clients.
- **Attendance Logs:** Stores and retrieves attendance records, supports pagination and filtering.
- **Fingerprint Support:** Allows registering and verifying fingerprints for check-in.
- **Notifications:** Sends WhatsApp notifications for check-in, check-out, inactivity, and monthly summaries.
- **Schedulers:**
    - Reminds inactive users.
    - Sends monthly attendance summaries.

---

## Architecture & Main Components

- **Entities:**
    - `Attendance`: Stores user, check-in/out times.
    - `Fingerprint`: Stores user fingerprint data.
- **Controllers:**
    - `AttendanceController`: REST endpoints for attendance.
    - `FingerprintController`: Endpoints for fingerprint registration and check-in.
- **Services:**
    - `AttendanceService`: Business logic for attendance.
    - `FingerprintService`: Logic for fingerprint registration/verification.
- **Feign Clients:**
    - `UserServiceFeignClient`, `MembershipServiceFeignClient`: Communicate with user and membership services.
    - `NotificationClient`: Sends notifications.
- **Repositories:**
    - `AttendanceRepository`, `FingerprintRepository`: Data access.
- **Scheduler:**
    - `InactiveUserScheduler`: Handles reminders and summaries.

---

## Tech Stack

- Java 21
- Spring Boot
- Spring Data JPA
- Spring Cloud OpenFeign
- PostgreSQL
- Lombok
- Maven

---

## API Endpoints

- `POST /api/attendances/check-in`: User check-in
- `POST /api/attendances/check-out/{id}`: User check-out
- `GET /api/attendances/paged`: Paginated attendance records
- `GET /api/attendances/user/{userId}/paged`: Paginated records for a user
- `POST /api/fingerprints/register`: Register fingerprint
- `POST /api/fingerprints/checkin`: Check-in with fingerprint

---

## Configuration

The service is configured via `src/main/resources/application.properties`:

```properties
spring.application.name=attendance-service
server.port=8003

# DATABASE CONFIG (POSTGRES)
spring.datasource.url=jdbc:***REMOVED***ql://localhost:5432/gym_attendance
spring.datasource.username=***REMOVED***
spring.datasource.password=***REMOVED***
spring.datasource.driver-class-name=org.***REMOVED***ql.Driver

# JPA / HIBERNATE
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# FEIGN CLIENTS
user.service.url=http://localhost:8001
membership.service.url=http://localhost:8002

# SCHEDULER SETTINGS (Optional)
# scheduler.daily-check.cron=0 0 2 * * *
```

---

## Schedulers

- **Inactive User Reminder:** Sends reminders to users who haven't checked in for 30 days.
- **Monthly Attendance Summary:** Sends a summary of last month's attendance to each user.

---

## Planned Improvements

- More robust error handling.
- Integration with real fingerprint hardware.
- Security enhancements.
- More tests.
- Asynchronous event handling.

---

## Getting Started

1. **Prerequisites:**
        - Java 21 installed.
        - Maven installed.
        - PostgreSQL running with a database named `gym_attendance`.
        - Ensure `user-service` and `membership-service` are running and expose the required endpoints.
2. **Build:**
        ```bash
        mvn clean install
        ```
3. **Run:**
        ```bash
        java -jar target/attendance-service-0.0.1-SNAPSHOT.jar
        # or
        mvn spring-boot:run
        ```

The service will start on `http://localhost:8003`.

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
