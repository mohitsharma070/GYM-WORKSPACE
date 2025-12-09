import { api } from "../utils/api";
import { API_BASE_WORKOUT } from "../utils/config";
import { type WorkoutLog, type WorkoutLogRequest } from "../types/WorkoutLog";

export async function submitWorkoutLog(payload: WorkoutLogRequest): Promise<WorkoutLog> {
  return api(`${API_BASE_WORKOUT}/workout/logs`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateWorkoutLog(id: number, payload: WorkoutLogRequest): Promise<WorkoutLog> {
  return api(`${API_BASE_WORKOUT}/workout/logs/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function fetchWorkoutLogById(id: number): Promise<WorkoutLog> {
  return api(`${API_BASE_WORKOUT}/workout/logs/${id}`);
}

export async function fetchWorkoutLogsByMemberId(memberId: number): Promise<WorkoutLog[]> {
  return api(`${API_BASE_WORKOUT}/workout/logs/member/${memberId}`);
}

export async function deleteWorkoutLog(id: number): Promise<void> {
  await api(`${API_BASE_WORKOUT}/workout/logs/${id}`, { method: "DELETE" });
}
