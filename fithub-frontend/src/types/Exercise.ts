export type BodyPart = "CHEST" | "BACK" | "LEGS" | "ARMS" | "SHOULDERS" | "CORE" | "FULL_BODY";
export type Equipment = "DUMBBELL" | "MACHINE" | "CABLE" | "BODYWEIGHT" | "BARBELL" | "KETTLEBELL" | "RESISTANCE_BAND" | "OTHER";
export enum Difficulty {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
}

export interface Exercise {
  id: number;
  name: string;
  bodyPart: BodyPart;
  equipment: Equipment;
  difficulty: Difficulty;
  videoUrl?: string;
  description?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
