import { useState } from "react";
import { fetchWorkoutPlanByDifficulty } from "../../api/workoutPlans";
import type { WorkoutDayExerciseDTO } from "../../types/WorkoutPlanDetails";
import { Difficulty } from "../../types/Exercise";

interface GroupedPlan {
    planId: number;
    planName: string;
    days: {
        dayId: number;
        dayNumber: number;
        exercises: WorkoutDayExerciseDTO[];
    }[];
}

export default function WorkoutSchedulePage() {
    const [plans, setPlans] = useState<GroupedPlan[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedPlan, setSelectedPlan] = useState<Difficulty | null>(null);

    const handleFetchPlan = async (difficulty: Difficulty) => {
        setLoading(true);
        setError("");
        setPlans([]);
        setSelectedPlan(difficulty);

        try {
            const data = await fetchWorkoutPlanByDifficulty(difficulty);

            if (!data || data.length === 0) {
                setError("No workout plan data found.");
                return;
            }

            // -------- GROUP BY PLAN → DAYS → EXERCISES ----------
            const groupBy = <T, K extends string | number>(
                array: T[], 
                keyGetter: (item: T) => K
            ) =>
                array.reduce((acc, item) => {
                    const key = keyGetter(item);
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(item);
                    return acc;
                }, {} as Record<K, T[]>);

            const groupedByPlan = groupBy(data, (x) => x.planId);

            const formattedPlans = Object.values(groupedByPlan).map((planExercises) => {
                const groupedByDay = groupBy(planExercises, (x) => x.dayId);

                const days = Object.values(groupedByDay)
                    .map((dayExercises) => ({
                        dayId: dayExercises[0].dayId,
                        dayNumber: dayExercises[0].dayNumber,
                        exercises: dayExercises.sort((a, b) => a.orderInDay - b.orderInDay),
                    }))
                    .sort((a, b) => a.dayNumber - b.dayNumber);

                return {
                    planId: planExercises[0].planId,
                    planName: planExercises[0].planName,
                    days,
                };
            });

            setPlans(formattedPlans);
        } catch (err) {
            setError("Failed to fetch workout plan. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Workout Schedules</h1>

            {/* Plan selection */}
            <div className="flex justify-center space-x-4 mb-8">
                {[Difficulty.BEGINNER, Difficulty.INTERMEDIATE, Difficulty.ADVANCED].map((level) => (
                    <button
                        key={level}
                        onClick={() => handleFetchPlan(level)}
                        className={`px-6 py-3 rounded-md font-semibold border transition 
                            ${
                                selectedPlan === level
                                    ? "bg-blue-600 text-white border-blue-700"
                                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                            }`}
                    >
                        {level}
                    </button>
                ))}
            </div>

            {/* Loading state */}
            {loading && (
                <div className="text-center text-gray-500">Loading workout plan...</div>
            )}

            {/* Error state */}
            {error && (
                <p className="text-red-600 text-center mb-4 font-semibold">{error}</p>
            )}

            {/* Plans */}
            {plans.map((plan) => (
                <div key={plan.planId} className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-center">{plan.planName}</h2>

                    <div className="space-y-6">
                        {plan.days.map((day) => (
                            <DayCard key={day.dayId} day={day} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ------------------ SEPARATE COMPONENTS ------------------ */

function DayCard({ day }: any) {
    return (
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-xl font-semibold mb-3">Day {day.dayNumber}</h3>

            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b">
                        <th className="py-2">Exercise</th>
                        <th className="py-2">Body Part</th>
                        <th className="py-2 text-center">Sets</th>
                        <th className="py-2 text-center">Reps</th>
                        <th className="py-2 text-center">Rest</th>
                    </tr>
                </thead>
                <tbody>
                    {day.exercises.map((ex: WorkoutDayExerciseDTO) => (
                                                <ExerciseRow
                                                    key={ex.id}
                                                    ex={ex}
                                                />                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ExerciseRow({ ex }: any) {
    return (
        <tr className="border-b hover:bg-gray-50">
            <td className="py-3 font-medium">{ex.exerciseName}</td>
            <td className="py-3 text-gray-600">{ex.bodyPart}</td>
            <td className="py-3 text-center">{ex.sets}</td>
            <td className="py-3 text-center">{ex.reps}</td>
            <td className="py-3 text-center">{ex.restTimeInSeconds}s</td>
        </tr>
    );
}
