import { api } from "../utils/api";
import { API_BASE_WORKOUT } from "../utils/config";
import { type AssignedWorkoutPlan, type AssignedWorkoutPlanRequest } from "../types/AssignedWorkoutPlan";

export async function assignWorkoutPlan(payload: AssignedWorkoutPlanRequest): Promise<AssignedWorkoutPlan> {
  return api(`${API_BASE_WORKOUT}/workout/assign`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAssignedWorkoutPlan(id: number, payload: AssignedWorkoutPlanRequest): Promise<AssignedWorkoutPlan> {
  return api(`${API_BASE_WORKOUT}/workout/assign/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function cancelAssignedWorkoutPlan(id: number): Promise<AssignedWorkoutPlan> {
  return api(`${API_BASE_WORKOUT}/workout/assign/${id}/cancel`, {
    method: "PUT",
  });
}

export async function fetchAssignedWorkoutPlanById(id: number): Promise<AssignedWorkoutPlan> {
  return api(`${API_BASE_WORKOUT}/workout/assign/${id}`);
}

export async function fetchAssignedWorkoutPlansByMemberId(memberId: number): Promise<AssignedWorkoutPlan[]> {
  return api(`${API_BASE_WORKOUT}/workout/assign/member/${memberId}`);
}

export async function fetchCurrentAssignedWorkoutPlanForMember(memberId: number): Promise<AssignedWorkoutPlan> {
  return api(`${API_BASE_WORKOUT}/workout/assign/member/${memberId}/current-plan`);
}

export async function fetchAssignedWorkoutPlansByTrainerId(trainerId: number): Promise<AssignedWorkoutPlan[]> {
  return api(`${API_BASE_WORKOUT}/workout/assign/trainer/${trainerId}`);
}

export async function deleteAssignedWorkoutPlan(id: number): Promise<void> {
  await api(`${API_BASE_WORKOUT}/workout/assign/${id}`, { method: "DELETE" });
}
