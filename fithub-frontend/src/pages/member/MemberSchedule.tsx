import { useCurrentAssignedWorkoutPlanForMember } from "../../hooks/useAssignedWorkoutPlans";
import { useWorkoutLogsByMemberId } from "../../hooks/useWorkoutLogs";
import { useEffect, useState } from "react";
import { fetchProfile } from "../../api/profile";
import { type UserProfile } from "../../api/profile";
import { Dumbbell } from "lucide-react";

export default function MemberSchedule() {
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

  const memberId = user?.id; // Get memberId from authenticated user

  const {
    data: assignedPlan,
    isLoading: isLoadingPlan,
    isError: isErrorPlan,
    error: planError,
  } = useCurrentAssignedWorkoutPlanForMember(memberId || 0);

  const {
    isLoading: isLoadingLogs,
    isError: isErrorLogs,
    error: logsError,
  } = useWorkoutLogsByMemberId(memberId || 0);

  if (loadingUser || isLoadingPlan || isLoadingLogs)
    return <p className="p-6 text-xl">Loading workout schedule...</p>;

  if (errorUser || isErrorPlan || isErrorLogs)
    return (
      <p className="p-6 text-xl text-red-600">
        Error loading schedule:{" "}
        {errorUser || planError?.message || logsError?.message}
      </p>
    );

  if (!assignedPlan || assignedPlan.status !== "ACTIVE")
    return (
      <div className="p-6 text-xl text-gray-700">
        No active workout plan assigned.
      </div>
    );

  const days = assignedPlan.workoutPlan.workoutDays.sort(
    (a, b) => a.dayNumber - b.dayNumber
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Workout Schedule</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Plan: {assignedPlan.workoutPlan.name} (
          {assignedPlan.workoutPlan.difficulty})
        </h2>
        <p className="text-gray-600 mb-2">
          {assignedPlan.workoutPlan.description}
        </p>
        <p className="text-sm text-gray-500">
          Assigned on: {assignedPlan.startDate}{" "}
          {assignedPlan.endDate && `- Ends: ${assignedPlan.endDate}`}
        </p>
      </div>

      {days.length === 0 && (
        <p className="text-gray-600">No workout days defined for this plan.</p>
      )}

      {days.map((day) => (
        <div key={day.id} className="bg-white shadow rounded-lg p-6 mb-4">
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
            <Dumbbell size={24} className="text-indigo-600" />
            Day {day.dayNumber}
            {day.notes && (
              <span className="text-base font-normal text-gray-500 ml-2">
                ({day.notes})
              </span>
            )}
          </h3>

          {day.workoutExercises.length === 0 && (
            <p className="text-gray-600">No exercises for this day.</p>
          )}

          <div className="space-y-3">
            {day.workoutExercises
              .sort((a, b) => a.orderInDay - b.orderInDay)
              .map((we) => (
                <div
                  key={we.id}
                  className="border p-4 rounded-md bg-gray-50 hover:bg-gray-100 transition"
                >
                  <p className="text-lg font-semibold flex items-center gap-2">
                    {we.exercise.name}
                  </p>
                  <p className="text-gray-700">
                    Sets: {we.sets}, Reps: {we.reps}
                  </p>
                  {we.restTimeInSeconds && (
                    <p className="text-gray-700">
                      Rest: {we.restTimeInSeconds}s
                    </p>
                  )}
                  {we.exercise.videoUrl && (
                    <a
                      href={we.exercise.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      Watch Video
                    </a>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}