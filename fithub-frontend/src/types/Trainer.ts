
export interface TrainerDetails {
  specialization: string;
  experienceYears: number;
  certification: string;
  phone: string;
  dateOfBirth?: string; // Add dateOfBirth for backend compatibility
}

export interface Trainer {
  id: number;
  name: string;
  email: string;
  role: string;
  dateOfBirth?: string; // Top-level fallback
  trainerDetails?: TrainerDetails;
}
