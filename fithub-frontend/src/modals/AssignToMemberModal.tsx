import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { type WorkoutPlan } from "../types/WorkoutPlan";
import { useUsers } from "../hooks/useUsers"; // Hook to fetch all users/members
import { useAssignWorkoutPlan } from "../hooks/useWorkoutPlans"; // Hook to assign workout plan

interface AssignToMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutPlan: WorkoutPlan;
  currentTrainerId: number; // The ID of the trainer/admin performing the assignment
}

export default function AssignToMemberModal({
  isOpen,
  onClose,
  workoutPlan,
  currentTrainerId,
}: AssignToMemberModalProps) {
  const { data: users, isLoading: isLoadingUsers, error: usersError } = useUsers();
  const assignWorkoutPlanMutation = useAssignWorkoutPlan();

  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  // Filter users to only show members (assuming role "ROLE_MEMBER")
  const members = users?.filter(user => user.role === 'ROLE_MEMBER') || [];

  useEffect(() => {
    // Reset selected member when modal opens or workoutPlan changes
    setSelectedMemberId(null);
  }, [isOpen, workoutPlan]);

  // Debugging logs - Keeping them for one more round
  console.log("AssignToMemberModal - members:", members);
  console.log("AssignToMemberModal - isLoadingUsers:", isLoadingUsers);
  console.log("AssignToMemberModal - usersError:", usersError);

  const handleAssign = async () => {
    if (!selectedMemberId) {
      alert("Please select a member.");
      return;
    }

    try {
      await assignWorkoutPlanMutation.mutateAsync({
        memberId: selectedMemberId,
        planId: workoutPlan.id,
        assignedByTrainerId: currentTrainerId,
        startDate: new Date().toISOString().split('T')[0], // Use current date as default start date
        status: "ACTIVE",
      });
      alert(`Workout plan "${workoutPlan.name}" assigned to member successfully!`);
      onClose();
    } catch (err: any) {
      alert(`Failed to assign plan: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4">Assign "{workoutPlan.name}" to Member</h2>

        {isLoadingUsers && <p>Loading members...</p>}
        {usersError && <p className="text-red-500">Error loading members: {usersError.message}</p>}

        {members.length > 0 ? (
          <div className="mb-4">
            <label htmlFor="member-select" className="block text-gray-700 text-sm font-bold mb-2">
              Select Member:
            </label>
            <select
              id="member-select"
              value={selectedMemberId || ""}
              onChange={(e) => setSelectedMemberId(Number(e.target.value))}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">-- Select a Member --</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="text-gray-600 mb-4">No members available for assignment.</p>
        )}

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={assignWorkoutPlanMutation.isPending || !selectedMemberId}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {assignWorkoutPlanMutation.isPending ? "Assigning..." : "Assign Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
