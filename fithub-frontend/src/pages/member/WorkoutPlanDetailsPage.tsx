import { useQuery } from "@tanstack/react-query";
import { fetchWorkoutPlanById } from "../../api/workoutPlans";
import { type WorkoutPlan } from "../../types/WorkoutPlan";
import { AlertTriangle, Calendar, Dumbbell, Zap } from "lucide-react";

export default function WorkoutPlanDetailsPage({ planId }: { planId: string }) {
  const {
    data: plan,
    isLoading,
    isError,
    error,
  } = useQuery<WorkoutPlan, Error>({
    queryKey: ["workoutPlan", planId],
    queryFn: () => fetchWorkoutPlanById(Number(planId)),
    enabled: !!planId,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Loading Workout Plan...</h1>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="pt-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="text-gray-600 mt-2">{error?.message || "Failed to load workout plan."}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold">Plan not found</h1>
        <p>This workout plan could not be found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">{plan.name}</h1>
          <p className="text-gray-600 mb-4">{plan.description}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
              <Zap size={16} />
              <strong>Difficulty:</strong> {plan.difficulty}
            </span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-700 mb-6 flex items-center gap-3">
          <Calendar size={24} />
          Workout Schedule
        </h2>

        {plan.workoutDays && plan.workoutDays.length > 0 ? (
          <div className="space-y-8">
            {plan.workoutDays.sort((a,b) => a.dayNumber - b.dayNumber).map((day) => (
              <div key={day.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Day {day.dayNumber}</h3>
                {day.notes && <p className="text-sm text-gray-500 mb-4 italic">Notes: {day.notes}</p>}
                
                <ul className="space-y-4">
                  {day.workoutExercises.sort((a,b) => a.orderInDay - b.orderInDay).map((we) => (
                    <li key={we.id} className="p-4 bg-gray-50 rounded-lg flex items-start gap-4">
                      <div className="flex-shrink-0 h-12 w-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                        <Dumbbell size={24} />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-lg text-gray-800">{we.exercise.name}</h4>
                        <div className="text-sm text-gray-600 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 mt-1">
                          <span><strong>Sets:</strong> {we.sets}</span>
                          <span><strong>Reps:</strong> {we.reps}</span>
                          {we.restTimeInSeconds && <span><strong>Rest:</strong> {we.restTimeInSeconds}s</span>}
                          <span className="capitalize col-span-2 md:col-span-1"><strong>Part:</strong> {we.exercise.bodyPart.replace(/_/g, " ").toLowerCase()}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No workout days and exercises defined for this plan yet.</p>
        )}
      </div>
    </div>
  );
}
