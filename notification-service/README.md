# Notification Service

This service is responsible for sending WhatsApp notifications for various events:
- membership_expiry
- payment_confirmation
- membership_renewal
- attendance_check_in
- attendance_check_out
- inactive_user_reminder
- monthly_attendance_summary
- workout_plan_assigned
- workout_plan_updated
- daily_workout_reminder
- birthday_greeting
- promotional
- trainer_assigned_member
- trainer_workout_completed

## Structure
- src/main/java/com/notificationservice: Main source code
- src/main/resources: Configuration files
- src/test/java/com/notificationservice: Tests

## How to use
1. Configure WhatsApp API credentials in `application.properties`.
2. Use the REST API endpoints to trigger notifications.

## TODO
- Implement WhatsApp API integration
- Add endpoints for each notification type
- Add tests
