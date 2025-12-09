package com.gym.workoutservice.service.impl;

import com.gym.workoutservice.dto.ExerciseRequest;
import com.gym.workoutservice.dto.ExerciseResponse;
import com.gym.workoutservice.entity.Exercise;
import com.gym.workoutservice.exception.BadRequestException;
import com.gym.workoutservice.exception.ResourceNotFoundException;
import com.gym.workoutservice.repository.ExerciseRepository;
import com.gym.workoutservice.service.IExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExerciseServiceImpl implements IExerciseService {

    private final ExerciseRepository exerciseRepository;

    @Override
    @Transactional
    public ExerciseResponse createExercise(ExerciseRequest request) {
        if (exerciseRepository.existsByName(request.name())) {
            throw new BadRequestException("Exercise with name '" + request.name() + "' already exists.");
        }

        Exercise exercise = new Exercise();
        exercise.setName(request.name());
        exercise.setBodyPart(request.bodyPart());
        exercise.setEquipment(request.equipment());
        exercise.setDifficulty(request.difficulty());
        exercise.setVideoUrl(request.videoUrl());
        exercise.setDescription(request.description());

        Exercise savedExercise = exerciseRepository.save(exercise);
        return mapToResponse(savedExercise);
    }

    @Override
    @Transactional
    public ExerciseResponse updateExercise(Long id, ExerciseRequest request) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found with id: " + id));

        // Check for name conflict if name is changed
        if (!exercise.getName().equals(request.name()) && exerciseRepository.existsByName(request.name())) {
            throw new BadRequestException("Exercise with name '" + request.name() + "' already exists.");
        }

        exercise.setName(request.name());
        exercise.setBodyPart(request.bodyPart());
        exercise.setEquipment(request.equipment());
        exercise.setDifficulty(request.difficulty());
        exercise.setVideoUrl(request.videoUrl());
        exercise.setDescription(request.description());

        Exercise updatedExercise = exerciseRepository.save(exercise);
        return mapToResponse(updatedExercise);
    }

    @Override
    public List<ExerciseResponse> getAllExercises() {
        return exerciseRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ExerciseResponse getExerciseById(Long id) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found with id: " + id));
        return mapToResponse(exercise);
    }

    @Override
    @Transactional
    public void deleteExercise(Long id) {
        if (!exerciseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Exercise not found with id: " + id);
        }
        exerciseRepository.deleteById(id);
    }

    // Manual mapping for now
    private ExerciseResponse mapToResponse(Exercise exercise) {
        return new ExerciseResponse(
                exercise.getId(),
                exercise.getName(),
                exercise.getBodyPart(),
                exercise.getEquipment(),
                exercise.getDifficulty(),
                exercise.getVideoUrl(),
                exercise.getDescription(),
                exercise.getCreatedAt(),
                exercise.getUpdatedAt()
        );
    }
}
