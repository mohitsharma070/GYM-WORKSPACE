import { api } from "../utils/api";
import { API_BASE_WORKOUT } from "../utils/config";
import {
  type WorkoutPlan,
  type WorkoutPlanRequest,
  type WorkoutDayRequest,
  type WorkoutExerciseRequest,
  type WorkoutDay,
} from "../types/WorkoutPlan";
import { type AssignWorkoutPlanRequest, type AssignedWorkoutPlan } from "../types/AssignWorkoutPlan";
import { type Difficulty } from "../types/Exercise";

export async function fetchAllWorkoutPlans(
  trainerId?: number,
  difficulty?: Difficulty
): Promise<WorkoutPlan[]> {
  let url = `${API_BASE_WORKOUT}/workout/plans`;
  const params = new URLSearchParams();
  if (trainerId) params.append("trainerId", trainerId.toString());
  if (difficulty) params.append("difficulty", difficulty);
  if (params.toString()) url += `?${params.toString()}`;

  return api(url);
}

export async function fetchWorkoutPlanById(id: number): Promise<WorkoutPlan> {
  return api(`${API_BASE_WORKOUT}/workout/plans/${id}`);
}

export async function createWorkoutPlan(
  payload: WorkoutPlanRequest
): Promise<WorkoutPlan> {
  return api(`${API_BASE_WORKOUT}/workout/plans`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateWorkoutPlan(
  id: number,
  payload: WorkoutPlanRequest
): Promise<WorkoutPlan> {
  return api(`${API_BASE_WORKOUT}/workout/plans/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteWorkoutPlan(id: number): Promise<void> {
  await api(`${API_BASE_WORKOUT}/workout/plans/${id}`, { method: "DELETE" });
}

// --- Workout Day API ---
export async function addWorkoutDayToPlan(
  planId: number,
  payload: WorkoutDayRequest
): Promise<WorkoutDay> {
  return api(`${API_BASE_WORKOUT}/workout/plans/${planId}/days`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateWorkoutDay(
  planId: number,
  dayId: number,
  payload: WorkoutDayRequest
): Promise<WorkoutDay> {
  return api(`${API_BASE_WORKOUT}/workout/plans/${planId}/days/${dayId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteWorkoutDay(
  planId: number,
  dayId: number
): Promise<void> {
  await api(`${API_BASE_WORKOUT}/workout/plans/${planId}/days/${dayId}`, {
    method: "DELETE",
  });
}

export async function fetchWorkoutDaysByPlanId(planId: number): Promise<WorkoutDay[]> {
    return api(`${API_BASE_WORKOUT}/workout/plans/${planId}/days`);
}

// --- Workout Exercise API (within a day) ---
export async function addExerciseToWorkoutDay(
  planId: number,
  dayId: number,
  payload: WorkoutExerciseRequest
): Promise<WorkoutDay> {
  return api(
    `${API_BASE_WORKOUT}/workout/plans/${planId}/days/${dayId}/exercises`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function updateWorkoutExercise(
  planId: number,
  dayId: number,
  exerciseId: number,
  payload: WorkoutExerciseRequest
): Promise<WorkoutDay> {
  return api(
    `${API_BASE_WORKOUT}/workout/plans/${planId}/days/${dayId}/exercises/${exerciseId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
}

export async function removeExerciseFromWorkoutDay(
  planId: number,
  dayId: number,
  exerciseId: number
): Promise<void> {
  await api(
    `${API_BASE_WORKOUT}/workout/plans/${planId}/days/${dayId}/exercises/${exerciseId}`,
    {
      method: "DELETE",
    }
  );
}

// --- Member Workout Plan Assignment API ---
export async function assignWorkoutPlanToMember(
  payload: AssignWorkoutPlanRequest
): Promise<AssignedWorkoutPlan> {
  return api(`${API_BASE_WORKOUT}/member/assign-workout-plan`, { // Assuming this is the correct endpoint
    method: "POST",
    body: JSON.stringify(payload),
  });
}
