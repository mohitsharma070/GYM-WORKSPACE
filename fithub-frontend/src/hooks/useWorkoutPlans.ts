import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllWorkoutPlans,
  fetchWorkoutPlanById,
  createWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  addWorkoutDayToPlan,
  updateWorkoutDay,
  deleteWorkoutDay,
  addExerciseToWorkoutDay,
  updateWorkoutExercise,
  removeExerciseFromWorkoutDay,
  fetchWorkoutDaysByPlanId,
  assignWorkoutPlanToMember,
} from "../api/workoutPlans";
import { type WorkoutPlan, type WorkoutPlanRequest, type WorkoutDay, type WorkoutDayRequest, type WorkoutExerciseRequest } from "../types/WorkoutPlan";
import { type AssignWorkoutPlanRequest, type AssignedWorkoutPlan } from "../types/AssignWorkoutPlan";
import { Difficulty } from "../types/Exercise";

export function useAllWorkoutPlans(trainerId?: number, difficulty?: Difficulty) {
  return useQuery<WorkoutPlan[], Error>({
    queryKey: ["workoutPlans", trainerId, difficulty],
    queryFn: () => fetchAllWorkoutPlans(trainerId, difficulty),
  });
}

export function useWorkoutPlan(id: number) {
  return useQuery<WorkoutPlan, Error>({
    queryKey: ["workoutPlan", id],
    queryFn: () => fetchWorkoutPlanById(id),
    enabled: !!id,
  });
}

export function useCreateWorkoutPlan() {
  const queryClient = useQueryClient();
  return useMutation<WorkoutPlan, Error, WorkoutPlanRequest>({
    mutationFn: createWorkoutPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workoutPlans"] });
    },
  });
}

export function useUpdateWorkoutPlan() {
  const queryClient = useQueryClient();
  return useMutation<WorkoutPlan, Error, { id: number; payload: WorkoutPlanRequest }>({
    mutationFn: ({ id, payload }) => updateWorkoutPlan(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workoutPlans"] });
      queryClient.invalidateQueries({ queryKey: ["workoutPlan", variables.id] });
    },
  });
}

export function useDeleteWorkoutPlan() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteWorkoutPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workoutPlans"] });
    },
  });
}

// --- Workout Day Hooks ---
export function useWorkoutDaysByPlanId(planId: number) {
  return useQuery<WorkoutDay[], Error>({
    queryKey: ["workoutDays", planId],
    queryFn: () => fetchWorkoutDaysByPlanId(planId),
    enabled: !!planId,
  });
}

export function useAddWorkoutDayToPlan() {
  const queryClient = useQueryClient();
  return useMutation<WorkoutDay, Error, { planId: number; payload: WorkoutDayRequest }>({
    mutationFn: ({ planId, payload }) => addWorkoutDayToPlan(planId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workoutPlan", variables.planId] });
      queryClient.invalidateQueries({ queryKey: ["workoutDays", variables.planId] });
    },
  });
}

export function useUpdateWorkoutDay() {
  const queryClient = useQueryClient();
  return useMutation<WorkoutDay, Error, { planId: number; dayId: number; payload: WorkoutDayRequest }>({
    mutationFn: ({ planId, dayId, payload }) => updateWorkoutDay(planId, dayId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workoutPlan", variables.planId] });
      queryClient.invalidateQueries({ queryKey: ["workoutDays", variables.planId] });
    },
  });
}

export function useDeleteWorkoutDay() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { planId: number; dayId: number }>({
    mutationFn: ({ planId, dayId }) => deleteWorkoutDay(planId, dayId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workoutPlan", variables.planId] });
      queryClient.invalidateQueries({ queryKey: ["workoutDays", variables.planId] });
    },
  });
}

// --- Workout Exercise Hooks ---
export function useAddExerciseToWorkoutDay() {
  const queryClient = useQueryClient();
  return useMutation<WorkoutDay, Error, { planId: number; dayId: number; payload: WorkoutExerciseRequest }>({
    mutationFn: ({ planId, dayId, payload }) => addExerciseToWorkoutDay(planId, dayId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workoutPlan", variables.planId] });
      queryClient.invalidateQueries({ queryKey: ["workoutDays", variables.planId] });
    },
  });
}

export function useUpdateWorkoutExercise() {
  const queryClient = useQueryClient();
  return useMutation<WorkoutDay, Error, { planId: number; dayId: number; exerciseId: number; payload: WorkoutExerciseRequest }>({
    mutationFn: ({ planId, dayId, exerciseId, payload }) => updateWorkoutExercise(planId, dayId, exerciseId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workoutPlan", variables.planId] });
      queryClient.invalidateQueries({ queryKey: ["workoutDays", variables.planId] });
    },
  });
}

export function useRemoveExerciseFromWorkoutDay() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { planId: number; dayId: number; exerciseId: number }>({
    mutationFn: ({ planId, dayId, exerciseId }) => removeExerciseFromWorkoutDay(planId, dayId, exerciseId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workoutPlan", variables.planId] });
      queryClient.invalidateQueries({ queryKey: ["workoutDays", variables.planId] });
    },
  });
}

// --- Workout Plan Assignment Hooks ---
export function useAssignWorkoutPlan() {
  const queryClient = useQueryClient();
  return useMutation<AssignedWorkoutPlan, Error, AssignWorkoutPlanRequest>({
    mutationFn: assignWorkoutPlanToMember,
    onSuccess: (data) => {
      // Invalidate relevant caches after assigning a workout plan
      queryClient.invalidateQueries({ queryKey: ["assignedWorkoutPlans", data.memberId] });
      queryClient.invalidateQueries({ queryKey: ["workoutPlans"] }); // Optionally invalidate all workout plans
    },
  });
}