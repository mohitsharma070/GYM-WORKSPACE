export interface TrainerDetails {
  specialization: string;
  experienceYears: number;
  certification: string;
  phone: string;
}

export interface Trainer {
  id: number;
  name: string;
  email: string;
  role: string;
  trainerDetails?: TrainerDetails;
}
