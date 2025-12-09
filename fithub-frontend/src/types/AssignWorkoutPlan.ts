export interface AssignWorkoutPlanRequest {
  memberId: number;
  planId: number;
  startDate: string; // YYYY-MM-DD
}

export interface AssignedWorkoutPlan {
  id: number;
  memberId: number;
  planId: number;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD, optional
  assignedDate: string; // ISO date string
}
