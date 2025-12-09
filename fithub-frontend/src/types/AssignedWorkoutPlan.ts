import { type WorkoutPlan } from "./WorkoutPlan";

export type AssignmentStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface AssignedWorkoutPlan {
  id: number;
  memberId: number;
  workoutPlan: WorkoutPlan; // Nested full workout plan details
  assignedByTrainerId?: number;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string, optional
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AssignedWorkoutPlanRequest {
  memberId: number;
  planId: number;
  assignedByTrainerId?: number;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  status?: AssignmentStatus;
}
