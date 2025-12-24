package com.gym.workoutservice.service.impl;

import com.gym.workoutservice.client.UserClient;
import com.gym.workoutservice.client.NotificationClient;
import com.gym.workoutservice.dto.NotificationRequest;
import com.gym.workoutservice.client.UserClient.UserResponse;
import com.gym.workoutservice.dto.WorkoutDayResponse;
import com.gym.workoutservice.dto.WorkoutDayWithExercisesRequest;
import com.gym.workoutservice.dto.WorkoutExerciseRequest;
import com.gym.workoutservice.dto.WorkoutExerciseResponse;
import com.gym.workoutservice.dto.WorkoutPlanRequest;
import com.gym.workoutservice.dto.WorkoutPlanResponse;
import com.gym.workoutservice.entity.Exercise;
import com.gym.workoutservice.entity.WorkoutDay;
import com.gym.workoutservice.entity.WorkoutExercise;
import com.gym.workoutservice.entity.WorkoutPlan;
import com.gym.workoutservice.exception.BadRequestException;
import com.gym.workoutservice.exception.ConflictException;
import com.gym.workoutservice.exception.ResourceNotFoundException;
import com.gym.workoutservice.repository.ExerciseRepository;
import com.gym.workoutservice.repository.WorkoutDayRepository;
import com.gym.workoutservice.repository.WorkoutExerciseRepository;
import com.gym.workoutservice.repository.WorkoutPlanRepository;
import com.gym.workoutservice.service.IWorkoutPlanService;
import com.gym.workoutservice.service.impl.ExerciseServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkoutPlanServiceImpl implements IWorkoutPlanService {

    private final WorkoutPlanRepository workoutPlanRepository;
    private final WorkoutDayRepository workoutDayRepository;
    private final WorkoutExerciseRepository workoutExerciseRepository;
    private final ExerciseRepository exerciseRepository;
    private final ExerciseServiceImpl exerciseService; // For Exercise mapping
    private final UserClient userClient; // Inject UserClient
    private final NotificationClient notificationClient;

    // --- Workout Plan CRUD ---
    @Override
    @Transactional
    public WorkoutPlanResponse createWorkoutPlan(WorkoutPlanRequest request) {
        if (workoutPlanRepository.existsByName(request.name())) {
            throw new ConflictException("Workout plan with name '" + request.name() + "' already exists.");
        }

        if (request.createdByTrainerId() != null) {
            UserResponse trainer = userClient.getUserById(request.createdByTrainerId());
            if (trainer == null || !"ROLE_TRAINER".equals(trainer.role)) {
                throw new BadRequestException("Only users with ROLE_TRAINER can create workout plans.");
            }
        }

        WorkoutPlan workoutPlan = new WorkoutPlan();
        workoutPlan.setName(request.name());
        workoutPlan.setDescription(request.description());
        workoutPlan.setDifficulty(request.difficulty());
        workoutPlan.setCreatedByTrainerId(request.createdByTrainerId());
        workoutPlan.setIsActive(request.isActive() != null ? request.isActive() : true);

        WorkoutPlan savedPlan = workoutPlanRepository.save(workoutPlan);
        return mapToWorkoutPlanResponse(savedPlan);
    }

    @Override
    @Transactional
    public WorkoutPlanResponse updateWorkoutPlan(Long id, WorkoutPlanRequest request) {
        WorkoutPlan workoutPlan = workoutPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout plan not found with id: " + id));

        if (!workoutPlan.getName().equals(request.name()) && workoutPlanRepository.existsByName(request.name())) {
            throw new ConflictException("Workout plan with name '" + request.name() + "' already exists.");
        }

        if (request.createdByTrainerId() != null && !workoutPlan.getCreatedByTrainerId().equals(request.createdByTrainerId())) {
            UserResponse trainer = userClient.getUserById(request.createdByTrainerId());
            if (trainer == null || !"ROLE_TRAINER".equals(trainer.role)) {
                throw new BadRequestException("Only users with ROLE_TRAINER can be assigned as plan creators.");
            }
        }

        workoutPlan.setName(request.name());
        workoutPlan.setDescription(request.description());
        workoutPlan.setDifficulty(request.difficulty());
        workoutPlan.setCreatedByTrainerId(request.createdByTrainerId());
        workoutPlan.setIsActive(request.isActive() != null ? request.isActive() : workoutPlan.getIsActive());

        WorkoutPlan updatedPlan = workoutPlanRepository.save(workoutPlan);

        // Send WhatsApp notification for workout plan updated
        try {
            if (updatedPlan.getCreatedByTrainerId() != null) {
                UserResponse trainer = userClient.getUserById(updatedPlan.getCreatedByTrainerId());
                NotificationRequest notification = new NotificationRequest();
                notification.setPhoneNumber(trainer.email); // Replace with phone if available
                notification.setType("WORKOUT_PLAN_UPDATED");
                java.util.Map<String, String> values = new java.util.HashMap<>();
                values.put("trainerName", trainer.name);
                values.put("workoutPlanName", updatedPlan.getName());
                String rendered = com.gym.workoutservice.util.TemplateLoader.renderTemplate(
                    "workout_plan_updated.html", values);
                if (rendered.isEmpty()) {
                    rendered = "Hi " + trainer.name + ", the workout plan '" + updatedPlan.getName() + "' has been updated.";
                }
                notification.setMessage(rendered);
                notificationClient.sendNotification(notification);
            }
        } catch (Exception e) {
            System.err.println("Failed to send workout plan updated notification: " + e.getMessage());
        }

        return mapToWorkoutPlanResponse(updatedPlan);
    }

    @Override
    @Transactional
    public void deleteWorkoutPlan(Long id) {
        if (!workoutPlanRepository.existsById(id)) {
            throw new ResourceNotFoundException("Workout plan not found with id: " + id);
        }
        workoutPlanRepository.deleteById(id);
    }

    @Override
    public List<WorkoutPlanResponse> getAllWorkoutPlans() {
        return workoutPlanRepository.findAll().stream()
                .map(this::mapToWorkoutPlanResponse)
                .collect(Collectors.toList());
    }

    @Override
    public WorkoutPlanResponse getWorkoutPlanById(Long id) {
        WorkoutPlan workoutPlan = workoutPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout plan not found with id: " + id));
        return mapToWorkoutPlanResponse(workoutPlan);
    }

    @Override
    public List<WorkoutPlanResponse> getWorkoutPlansByTrainer(Long trainerId) {
        return workoutPlanRepository.findByCreatedByTrainerId(trainerId).stream()
                .map(this::mapToWorkoutPlanResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<WorkoutPlanResponse> getWorkoutPlansByDifficulty(Exercise.Difficulty difficulty) {
        return workoutPlanRepository.findByDifficulty(difficulty).stream()
                .map(this::mapToWorkoutPlanResponse)
                .collect(Collectors.toList());
    }

    // --- Workout Day Management ---
    @Override
    @Transactional
    public WorkoutDayResponse addWorkoutDayToPlan(Long planId, WorkoutDayWithExercisesRequest request) {
        WorkoutPlan workoutPlan = workoutPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout plan not found with id: " + planId));

        if (workoutDayRepository.findByWorkoutPlanIdAndDayNumber(planId, request.dayNumber()).isPresent()) {
            throw new ConflictException("Workout day number " + request.dayNumber() + " already exists for this plan.");
        }

        WorkoutDay workoutDay = new WorkoutDay();
        workoutDay.setWorkoutPlan(workoutPlan);
        workoutDay.setDayNumber(request.dayNumber());
        workoutDay.setNotes(request.notes());
        WorkoutDay savedDay = workoutDayRepository.save(workoutDay);

        // Add exercises
        if (request.workoutExercises() != null && !request.workoutExercises().isEmpty()) {
            request.workoutExercises().forEach(exReq -> {
                Exercise exercise = exerciseRepository.findById(exReq.exerciseId())
                        .orElseThrow(() -> new ResourceNotFoundException("Exercise not found with id: " + exReq.exerciseId()));
                
                WorkoutExercise workoutExercise = new WorkoutExercise();
                workoutExercise.setWorkoutDay(savedDay);
                workoutExercise.setExercise(exercise);
                workoutExercise.setSets(exReq.sets());
                workoutExercise.setReps(exReq.reps());
                workoutExercise.setRestTimeInSeconds(exReq.restTimeInSeconds());
                workoutExercise.setOrderInDay(exReq.orderInDay());
                workoutExerciseRepository.save(workoutExercise);
                savedDay.getWorkoutExercises().add(workoutExercise);
            });
        }
        return mapToWorkoutDayResponse(savedDay);
    }

    @Override
    @Transactional
    public WorkoutDayResponse updateWorkoutDay(Long planId, Long dayId, WorkoutDayWithExercisesRequest request) {
        WorkoutPlan workoutPlan = workoutPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout plan not found with id: " + planId));
        WorkoutDay workoutDay = workoutDayRepository.findById(dayId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout day not found with id: " + dayId));

        if (!workoutDay.getWorkoutPlan().getId().equals(planId)) {
            throw new BadRequestException("Workout day with id " + dayId + " does not belong to plan with id " + planId);
        }

        // Check if day number is changed and conflicts
        if (!workoutDay.getDayNumber().equals(request.dayNumber())) {
            if (workoutDayRepository.findByWorkoutPlanIdAndDayNumber(planId, request.dayNumber()).isPresent()) {
                throw new ConflictException("Workout day number " + request.dayNumber() + " already exists for this plan.");
            }
            workoutDay.setDayNumber(request.dayNumber());
        }
        workoutDay.setNotes(request.notes());

        // Update exercises: remove existing, add new ones (simple approach for now)
        workoutExerciseRepository.deleteAll(workoutDay.getWorkoutExercises());
        workoutDay.getWorkoutExercises().clear(); // Clear the collection to reflect changes

        if (request.workoutExercises() != null && !request.workoutExercises().isEmpty()) {
            request.workoutExercises().forEach(exReq -> {
                Exercise exercise = exerciseRepository.findById(exReq.exerciseId())
                        .orElseThrow(() -> new ResourceNotFoundException("Exercise not found with id: " + exReq.exerciseId()));

                WorkoutExercise workoutExercise = new WorkoutExercise();
                workoutExercise.setWorkoutDay(workoutDay);
                workoutExercise.setExercise(exercise);
                workoutExercise.setSets(exReq.sets());
                workoutExercise.setReps(exReq.reps());
                workoutExercise.setRestTimeInSeconds(exReq.restTimeInSeconds());
                workoutExercise.setOrderInDay(exReq.orderInDay());
                workoutExerciseRepository.save(workoutExercise);
                workoutDay.getWorkoutExercises().add(workoutExercise);
            });
        }
        WorkoutDay updatedDay = workoutDayRepository.save(workoutDay);
        return mapToWorkoutDayResponse(updatedDay);
    }

    @Override
    @Transactional
    public void deleteWorkoutDay(Long planId, Long dayId) {
        WorkoutDay workoutDay = workoutDayRepository.findById(dayId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout day not found with id: " + dayId));

        if (!workoutDay.getWorkoutPlan().getId().equals(planId)) {
            throw new BadRequestException("Workout day with id " + dayId + " does not belong to plan with id " + planId);
        }
        workoutDayRepository.delete(workoutDay);
    }

    @Override
    public Set<WorkoutDayResponse> getWorkoutDaysByPlanId(Long planId) {
        return workoutDayRepository.findByWorkoutPlanId(planId).stream()
                .map(this::mapToWorkoutDayResponse)
                .collect(Collectors.toSet());
    }

    // --- Workout Exercise Management (within a day) ---
    @Override
    @Transactional
    public WorkoutDayResponse addExerciseToWorkoutDay(Long planId, Long dayId, WorkoutExerciseRequest request) {
        WorkoutDay workoutDay = workoutDayRepository.findById(dayId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout day not found with id: " + dayId));

        if (!workoutDay.getWorkoutPlan().getId().equals(planId)) {
            throw new BadRequestException("Workout day with id " + dayId + " does not belong to plan with id " + planId);
        }

        if (workoutExerciseRepository.findByWorkoutDayIdAndExerciseId(dayId, request.exerciseId()).isPresent()) {
            throw new ConflictException("Exercise with id " + request.exerciseId() + " already exists in workout day " + dayId);
        }

        Exercise exercise = exerciseRepository.findById(request.exerciseId())
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found with id: " + request.exerciseId()));
        
        WorkoutExercise workoutExercise = new WorkoutExercise();
        workoutExercise.setWorkoutDay(workoutDay);
        workoutExercise.setExercise(exercise);
        workoutExercise.setSets(request.sets());
        workoutExercise.setReps(request.reps());
        workoutExercise.setRestTimeInSeconds(request.restTimeInSeconds());
        workoutExercise.setOrderInDay(request.orderInDay());
        workoutExerciseRepository.save(workoutExercise);
        workoutDay.getWorkoutExercises().add(workoutExercise); // Add to collection for eager response update

        return mapToWorkoutDayResponse(workoutDay);
    }

    @Override
    @Transactional
    public WorkoutDayResponse updateWorkoutExercise(Long planId, Long dayId, Long exerciseId, WorkoutExerciseRequest request) {
        WorkoutDay workoutDay = workoutDayRepository.findById(dayId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout day not found with id: " + dayId));

        if (!workoutDay.getWorkoutPlan().getId().equals(planId)) {
            throw new BadRequestException("Workout day with id " + dayId + " does not belong to plan with id " + planId);
        }

        WorkoutExercise workoutExercise = workoutExerciseRepository.findByWorkoutDayIdAndExerciseId(dayId, exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout exercise not found in day " + dayId + " for exercise " + exerciseId));

        // Check if changing exerciseId conflicts with existing ones
        if (!workoutExercise.getExercise().getId().equals(request.exerciseId())) {
            if (workoutExerciseRepository.findByWorkoutDayIdAndExerciseId(dayId, request.exerciseId()).isPresent()) {
                throw new ConflictException("Exercise with id " + request.exerciseId() + " already exists in workout day " + dayId);
            }
            Exercise newExercise = exerciseRepository.findById(request.exerciseId())
                    .orElseThrow(() -> new ResourceNotFoundException("New exercise not found with id: " + request.exerciseId()));
            workoutExercise.setExercise(newExercise);
        }

        workoutExercise.setSets(request.sets());
        workoutExercise.setReps(request.reps());
        workoutExercise.setRestTimeInSeconds(request.restTimeInSeconds());
        workoutExercise.setOrderInDay(request.orderInDay());
        WorkoutExercise updatedWorkoutExercise = workoutExerciseRepository.save(workoutExercise);
        
        return mapToWorkoutDayResponse(workoutDay); // Re-map the day to include updated exercise
    }

    @Override
    @Transactional
    public void removeExerciseFromWorkoutDay(Long planId, Long dayId, Long exerciseId) {
        WorkoutDay workoutDay = workoutDayRepository.findById(dayId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout day not found with id: " + dayId));

        if (!workoutDay.getWorkoutPlan().getId().equals(planId)) {
            throw new BadRequestException("Workout day with id " + dayId + " does not belong to plan with id " + planId);
        }

        WorkoutExercise workoutExercise = workoutExerciseRepository.findByWorkoutDayIdAndExerciseId(dayId, exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout exercise not found in day " + dayId + " for exercise " + exerciseId));

        workoutExerciseRepository.delete(workoutExercise);
        workoutDay.getWorkoutExercises().remove(workoutExercise); // Remove from collection to reflect in response
    }

    // --- Mappers ---
    private WorkoutPlanResponse mapToWorkoutPlanResponse(WorkoutPlan workoutPlan) {
        Set<WorkoutDayResponse> dayResponses = workoutPlan.getWorkoutDays().stream()
            .map(this::mapToWorkoutDayResponse)
            .sorted(Comparator.comparing(WorkoutDayResponse::dayNumber)) // Sort days by dayNumber
            .collect(Collectors.toCollection(java.util.LinkedHashSet::new)); // Use LinkedHashSet to maintain order if needed

        return new WorkoutPlanResponse(
            workoutPlan.getId(),
            workoutPlan.getName(),
            workoutPlan.getDescription(),
            workoutPlan.getDifficulty(),
            workoutPlan.getCreatedByTrainerId(),
            workoutPlan.getIsActive(),
            workoutPlan.getCreatedAt(),
            workoutPlan.getUpdatedAt(),
            dayResponses
        );
    }

    private WorkoutDayResponse mapToWorkoutDayResponse(WorkoutDay workoutDay) {
        Set<WorkoutExerciseResponse> exerciseResponses = workoutDay.getWorkoutExercises().stream()
            .map(this::mapToWorkoutExerciseResponse)
            .sorted(Comparator.comparing(WorkoutExerciseResponse::orderInDay)) // Sort exercises by orderInDay
            .collect(Collectors.toCollection(java.util.LinkedHashSet::new));

        return new WorkoutDayResponse(
            workoutDay.getId(),
            workoutDay.getWorkoutPlan().getId(),
            workoutDay.getDayNumber(),
            workoutDay.getNotes(),
            workoutDay.getCreatedAt(),
            workoutDay.getUpdatedAt(),
            exerciseResponses
        );
    }

    private WorkoutExerciseResponse mapToWorkoutExerciseResponse(WorkoutExercise workoutExercise) {
        return new WorkoutExerciseResponse(
            workoutExercise.getId(),
            workoutExercise.getWorkoutDay().getId(),
            exerciseService.getExerciseById(workoutExercise.getExercise().getId()), // Reusing ExerciseService to get full ExerciseResponse
            workoutExercise.getSets(),
            workoutExercise.getReps(),
            workoutExercise.getRestTimeInSeconds(),
            workoutExercise.getOrderInDay(),
            workoutExercise.getCreatedAt(),
            workoutExercise.getUpdatedAt()
        );
    }
}

