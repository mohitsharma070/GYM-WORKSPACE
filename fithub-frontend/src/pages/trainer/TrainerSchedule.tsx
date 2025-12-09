import { useEffect, useState } from "react";
import { fetchProfile } from "../../api/profile";
import { type UserProfile } from "../../api/profile";
import { useAllWorkoutPlans } from "../../hooks/useWorkoutPlans";
import { useAssignedWorkoutPlansByTrainerId } from "../../hooks/useAssignedWorkoutPlans";
import { Dumbbell } from "lucide-react";
import type { WorkoutPlan } from "../../types/WorkoutPlan";

export default function TrainerSchedule() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [errorUser, setErrorUser] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchProfile();
        setUser(data);
      } catch (err: any) {
        setErrorUser(err.message || "Failed to load user profile.");
      } finally {
        setLoadingUser(false);
      }
    };
    loadProfile();
  }, []);

  const trainerId = user?.id;

  const {
    data: createdPlans,
    isLoading: isLoadingCreatedPlans,
    isError: isErrorCreatedPlans,
    error: createdPlansError,
  } = useAllWorkoutPlans(trainerId || 0);

  const {
    data: assignedPlans,
    isLoading: isLoadingAssignedPlans,
    isError: isErrorAssignedPlans,
    error: assignedPlansError,
  } = useAssignedWorkoutPlansByTrainerId(trainerId || 0);

  if (loadingUser || isLoadingCreatedPlans || isLoadingAssignedPlans) {
    return <p className="p-6 text-xl">Loading trainer schedule...</p>;
  }

  if (errorUser || isErrorCreatedPlans || isErrorAssignedPlans) {
    return (
      <p className="p-6 text-xl text-red-600">
        Error loading schedule:{" "}
        {errorUser || createdPlansError?.message || assignedPlansError?.message}
      </p>
    );
  }

  // --- Aggregate Schedule Data ---
  const scheduleData: { [key: number]: { plan: WorkoutPlan; type: string }[] } = {};

  createdPlans?.forEach((plan) => {
    plan.workoutDays.forEach((day) => {
      if (!scheduleData[day.dayNumber]) scheduleData[day.dayNumber] = [];
      scheduleData[day.dayNumber].push({ plan, type: "Created" });
    });
  });

  assignedPlans?.forEach((assigned) => {
    assigned.workoutPlan.workoutDays.forEach((day) => {
      if (!scheduleData[day.dayNumber]) scheduleData[day.dayNumber] = [];
      scheduleData[day.dayNumber].push({ plan: assigned.workoutPlan, type: `Assigned to Member ${assigned.memberId}` });
    });
  });

  const sortedDays = Object.keys(scheduleData)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="p-6 pb-20">
      <h1 className="text-3xl font-bold mb-6">Trainer Schedule Overview</h1>

      {sortedDays.length === 0 && <p className="text-gray-600">No workout plans created or assigned.</p>}

      {sortedDays.map((dayNumber) => (
        <div key={dayNumber} className="bg-white shadow rounded-lg p-6 mb-4">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <Dumbbell size={24} className="text-blue-600" />
            Day {dayNumber}
          </h2>

          {scheduleData[dayNumber].map((entry, index) => (
            <div key={`${dayNumber}-${entry.plan.id}-${index}`} className="border p-4 rounded-md bg-gray-50 mb-3">
              <h3 className="text-lg font-semibold">{entry.plan.name} ({entry.type})</h3>
              <p className="text-gray-700 text-sm">Difficulty: {entry.plan.difficulty}</p>
              <p className="text-gray-700 text-sm">{entry.plan.description}</p>
              
              <div className="mt-2 space-y-1">
                {entry.plan.workoutDays.find(d => d.dayNumber === dayNumber)?.workoutExercises.sort((a,b) => a.orderInDay - b.orderInDay).map(we => (
                    <div key={we.id} className="text-sm border-t border-gray-200 pt-2 mt-2">
                        <p className="font-medium">{we.exercise.name}</p>
                        <p className="text-gray-600">Sets: {we.sets}, Reps: {we.reps}</p>
                        {we.restTimeInSeconds && <p className="text-gray-600">Rest: {we.restTimeInSeconds}s</p>}
                    </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}