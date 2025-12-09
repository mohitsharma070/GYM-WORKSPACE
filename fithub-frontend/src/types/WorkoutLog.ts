import { type Exercise } from "./Exercise";

export interface WorkoutLog {
  id: number;
  memberId: number;
  exercise: Exercise; // Nested Exercise details
  logDate: string; // ISO date string
  actualSets?: number;
  actualReps?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutLogRequest {
  memberId: number;
  exerciseId: number;
  logDate: string; // ISO date string
  actualSets?: number;
  actualReps?: string;
  notes?: string;
}
