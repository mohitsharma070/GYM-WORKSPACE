export interface WorkoutDayExerciseDTO {
    id: number;
    planId: number;
    planName: string;
    dayId: number;
    dayNumber: number;
    exerciseId: number;
    orderInDay: number;
    exerciseName: string;
    sets: number;
    reps: string;
    restTimeInSeconds: number;
    bodyPart: string;
}
