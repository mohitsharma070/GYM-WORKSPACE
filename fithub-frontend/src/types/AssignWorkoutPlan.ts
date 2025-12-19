export interface AssignWorkoutPlanRequest {
  memberId: number;
  planId: number;
  assignedByTrainerId: number; // Added this field
  startDate: string; // YYYY-MM-DD
  status: "ACTIVE" | "COMPLETED" | "CANCELLED"; // Added status field
}

export interface AssignedWorkoutPlan {
  id: number;
  memberId: number;
  planId: number;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD, optional
  assignedDate: string; // ISO date string
  status: "ACTIVE" | "COMPLETED" | "CANCELLED"; // Added status field
}
