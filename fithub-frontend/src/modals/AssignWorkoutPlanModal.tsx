import { useState } from "react";
import { type WorkoutPlan } from "../types/WorkoutPlan";
import { useAssignWorkoutPlan } from "../hooks/useWorkoutPlans";

interface AssignWorkoutPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (planId: number, startDate: string) => void;
  memberId: number;
  trainerId: number;
  availableWorkoutPlans: WorkoutPlan[];
}

export default function AssignWorkoutPlanModal({
  isOpen,
  onClose,
  memberId,
  trainerId,
  availableWorkoutPlans,
}: AssignWorkoutPlanModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const assignPlanMutation = useAssignWorkoutPlan();

  const handleAssign = async () => {
    if (!selectedPlanId || !startDate) {
      alert("Please select a plan and start date.");
      return;
    }

    try {
      await assignPlanMutation.mutateAsync({
        memberId: memberId,
        planId: selectedPlanId,
        assignedByTrainerId: trainerId,
        startDate: startDate,
        status: "ACTIVE",
      });
      alert("Workout plan assigned successfully!");
      onClose();
    } catch (err: any) {
      alert(`Failed to assign plan: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Assign Workout Plan to Client</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Select Plan:</label>
            <select
              value={selectedPlanId || ""}
              onChange={(e) => setSelectedPlanId(Number(e.target.value))}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">-- Select a Plan --</option>
              {availableWorkoutPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} ({plan.difficulty})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Cancel
          </button>
          <button onClick={handleAssign} disabled={assignPlanMutation.isPending} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            {assignPlanMutation.isPending ? "Assigning..." : "Assign Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
