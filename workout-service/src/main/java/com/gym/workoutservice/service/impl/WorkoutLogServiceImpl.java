package com.gym.workoutservice.service.impl;

import com.gym.workoutservice.client.UserClient;
import com.gym.workoutservice.dto.WorkoutLogRequest;
import com.gym.workoutservice.dto.WorkoutLogResponse;
import com.gym.workoutservice.entity.Exercise;
import com.gym.workoutservice.entity.WorkoutLog;
import com.gym.workoutservice.exception.BadRequestException;
import com.gym.workoutservice.exception.ConflictException;
import com.gym.workoutservice.exception.ResourceNotFoundException;
import com.gym.workoutservice.repository.ExerciseRepository;
import com.gym.workoutservice.repository.WorkoutLogRepository;
import com.gym.workoutservice.service.IWorkoutLogService;
import com.gym.workoutservice.client.NotificationClient;
import com.gym.workoutservice.dto.NotificationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkoutLogServiceImpl implements IWorkoutLogService {

    private final WorkoutLogRepository workoutLogRepository;
    private final ExerciseRepository exerciseRepository;
    private final ExerciseServiceImpl exerciseService; // For Exercise mapping
    private final UserClient userClient; // Inject UserClient
    private final NotificationClient notificationClient;

    @Override
    @Transactional
    public WorkoutLogResponse submitWorkoutLog(WorkoutLogRequest request) {
        if (!userClient.userExists(request.memberId())) {
            throw new ResourceNotFoundException("Member with id " + request.memberId() + " not found.");
        }

        // Optional: Check if a log for this member, exercise, and date already exists to prevent duplicates
        if (workoutLogRepository.findByMemberIdAndExerciseIdAndLogDate(request.memberId(), request.exerciseId(), request.logDate()).isPresent()) {
            throw new ConflictException("Workout log for member " + request.memberId() + ", exercise " + request.exerciseId() + " on " + request.logDate() + " already exists.");
        }

        Exercise exercise = exerciseRepository.findById(request.exerciseId())
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found with id: " + request.exerciseId()));

        WorkoutLog workoutLog = new WorkoutLog();
        workoutLog.setMemberId(request.memberId());
        workoutLog.setExercise(exercise);
        workoutLog.setLogDate(request.logDate());
        workoutLog.setActualSets(request.actualSets());
        workoutLog.setActualReps(request.actualReps());
        workoutLog.setNotes(request.notes());

        WorkoutLog savedLog = workoutLogRepository.save(workoutLog);
        return mapToResponse(savedLog);
    }

    @Override
    @Transactional
    public WorkoutLogResponse updateWorkoutLog(Long id, WorkoutLogRequest request) {
        WorkoutLog workoutLog = workoutLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout log not found with id: " + id));

        if (!userClient.userExists(request.memberId())) {
            throw new ResourceNotFoundException("Member with id " + request.memberId() + " not found.");
        }

        // Optional: Check if the update would cause a conflict (e.g., changing memberId/exerciseId/logDate to an existing log)
        if (!workoutLog.getMemberId().equals(request.memberId()) || !workoutLog.getExercise().getId().equals(request.exerciseId()) || !workoutLog.getLogDate().equals(request.logDate())) {
            if (workoutLogRepository.findByMemberIdAndExerciseIdAndLogDate(request.memberId(), request.exerciseId(), request.logDate()).isPresent()) {
                throw new ConflictException("Another workout log for member " + request.memberId() + ", exercise " + request.exerciseId() + " on " + request.logDate() + " already exists.");
            }
        }

        Exercise exercise = exerciseRepository.findById(request.exerciseId())
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found with id: " + request.exerciseId()));

        workoutLog.setMemberId(request.memberId()); // Member ID can be updated? Usually not. Assuming it can for now.
        workoutLog.setExercise(exercise);
        workoutLog.setLogDate(request.logDate());
        workoutLog.setActualSets(request.actualSets());
        workoutLog.setActualReps(request.actualReps());
        workoutLog.setNotes(request.notes());

        if (request.status() == WorkoutLog.WorkoutStatus.COMPLETED && request.completedByTrainerId() != null) {
            workoutLog.setStatus(WorkoutLog.WorkoutStatus.COMPLETED);
            workoutLog.setCompletedByTrainerId(request.completedByTrainerId());

            try {
                UserClient.UserResponse member = userClient.getUserById(workoutLog.getMemberId());
                UserClient.UserResponse trainer = userClient.getUserById(request.completedByTrainerId());
                NotificationRequest notification = new NotificationRequest();
                notification.setPhoneNumber(member.email); // or member.phone
                notification.setType("TRAINER_WORKOUT_COMPLETED");
                notification.setMessage("Hi " + member.name + ", your workout '" + workoutLog.getExercise().getName() + "' has been marked as completed by trainer " + trainer.name + ".");
                notificationClient.sendNotification(notification);
            } catch (Exception e) {
                System.err.println("Failed to send workout completion notification: " + e.getMessage());
            }
        }

        WorkoutLog updatedLog = workoutLogRepository.save(workoutLog);
        return mapToResponse(updatedLog);
    }

    @Override
    public WorkoutLogResponse getWorkoutLogById(Long id) {
        WorkoutLog workoutLog = workoutLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout log not found with id: " + id));
        return mapToResponse(workoutLog);
    }

    @Override
    public List<WorkoutLogResponse> getWorkoutLogsByMemberId(Long memberId) {
        return workoutLogRepository.findByMemberId(memberId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteWorkoutLog(Long id) {
        if (!workoutLogRepository.existsById(id)) {
            throw new ResourceNotFoundException("Workout log not found with id: " + id);
        }
        workoutLogRepository.deleteById(id);
    }

    // Mapper
    private WorkoutLogResponse mapToResponse(WorkoutLog workoutLog) {
        return new WorkoutLogResponse(
                workoutLog.getId(),
                workoutLog.getMemberId(),
                exerciseService.getExerciseById(workoutLog.getExercise().getId()), // Get full exercise details
                workoutLog.getLogDate(),
                workoutLog.getActualSets(),
                workoutLog.getActualReps(),
                workoutLog.getNotes(),
                workoutLog.getCreatedAt(),
                workoutLog.getUpdatedAt()
        );
    }
}
