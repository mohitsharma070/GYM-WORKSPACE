import type { Exercise, Difficulty } from "./Exercise";

export interface WorkoutExercise {
  id: number;
  workoutDayId: number;
  exercise: Exercise;
  sets: number;
  reps: string;
  restTimeInSeconds?: number;
  orderInDay: number;
  createdAt: string;
  updatedAt: string;
}

export class WorkoutDayImpl {
  id!: number;
  planId!: number; // Reference to the parent plan's ID
  dayNumber!: number;
  notes?: string;
  createdAt!: string;
  updatedAt!: string;
  workoutExercises!: WorkoutExercise[];
}

export type WorkoutDay = WorkoutDayImpl;

export interface WorkoutPlan {
  id: number;
  name: string;
  description?: string;
  difficulty: Difficulty;
  createdByTrainerId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  workoutDays: WorkoutDay[];
}

export interface WorkoutExerciseRequest {
  exerciseId: number;
  sets: number;
  reps: string;
  restTimeInSeconds?: number;
  orderInDay: number;
}

export interface WorkoutDayRequest {
  dayNumber: number;
  notes?: string;
  workoutExercises: WorkoutExerciseRequest[];
}

export interface WorkoutPlanRequest {
  name: string;
  description?: string;
  difficulty: Difficulty;
  createdByTrainerId?: number;
  isActive?: boolean;
}

