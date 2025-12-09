import { api } from "../utils/api";
import { API_BASE_WORKOUT } from "../utils/config";
import { type Exercise, type Difficulty, type BodyPart, type Equipment } from "../types/Exercise";

export interface CreateExercisePayload {
  name: string;
  bodyPart: BodyPart;
  equipment: Equipment;
  difficulty: Difficulty;
  videoUrl?: string;
  description?: string;
}

export interface UpdateExercisePayload {
  name?: string;
  bodyPart?: BodyPart;
  equipment?: Equipment;
  difficulty?: Difficulty;
  videoUrl?: string;
  description?: string;
}

export async function fetchAllExercises(): Promise<Exercise[]> {
  return api(`${API_BASE_WORKOUT}/workout/exercises`);
}

export async function fetchExerciseById(id: number): Promise<Exercise> {
  return api(`${API_BASE_WORKOUT}/workout/exercises/${id}`);
}

export async function createExercise(payload: CreateExercisePayload): Promise<Exercise> {
  return api(`${API_BASE_WORKOUT}/workout/exercises`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateExercise(id: number, payload: UpdateExercisePayload): Promise<Exercise> {
  return api(`${API_BASE_WORKOUT}/workout/exercises/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteExercise(id: number): Promise<void> {
  await api(`${API_BASE_WORKOUT}/workout/exercises/${id}`, {
    method: "DELETE",
  });
}
