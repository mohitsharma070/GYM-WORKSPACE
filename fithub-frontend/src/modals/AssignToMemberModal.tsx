import { useState } from "react";
import { X } from "lucide-react";
import { type WorkoutPlan } from "../types/WorkoutPlan";
import { useUsers } from "../hooks/useUsers"; // Hook to fetch all users/members
// import { usePlans } from "../hooks/usePlans";

interface AssignToMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutPlan: WorkoutPlan;
}




export default function AssignToMemberModal({ isOpen, onClose, workoutPlan }: AssignToMemberModalProps) {
  const {
    data: usersPage,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useUsers({ page: 0, size: 500, sortBy: "name", sortDir: "asc" });
  const users = usersPage?.content || [];
  // const { data: plans, isLoading: isLoadingPlans } = usePlans();


  // Filter users to only show members (assuming role "ROLE_MEMBER")
  const members = users?.filter(user => user.role === 'ROLE_MEMBER') || [];





  // Assignment state (optional, for feedback)
  const [assigningId, setAssigningId] = useState<number | null>(null);
  // Placeholder: Assignment handler
  const handleAssign = (memberId: number) => {
    setAssigningId(memberId);
    // TODO: Implement actual assignment logic (API call)
    setTimeout(() => {
      setAssigningId(null);
      alert(`Assigned plan to member ID ${memberId}`);
    }, 800);
  };




  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center min-h-screen z-50">
      <div className="bg-sky-100 p-8 rounded-xl shadow-2xl w-full max-w-6xl relative border border-sky-200 max-h-[95vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-white border border-gray-200 rounded-full p-1 shadow transition-colors duration-150 z-10" aria-label="Close">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
          <span>Assign</span>
          <span className="truncate text-blue-700 max-w-xs" title={workoutPlan.name}
            >"{workoutPlan.name}"</span>
          <span>to Member</span>
        </h2>
        <div className="border-b border-gray-200 mb-4"></div>

        {isLoadingUsers && <p>Loading members...</p>}
        {usersError && <p className="text-red-500">Error loading members: {usersError.message}</p>}



        {members.length > 0 ? (
          <div className="mb-4">
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-blue-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">#</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Member Name</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Email Address</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Membership Plan</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, idx) => (
                    <tr key={member.id}>
                      <td className="px-4 py-3">{idx + 1}</td>
                      <td className="px-4 py-3">{member.name}</td>
                      <td className="px-4 py-3">{member.email}</td>
                      <td className="px-4 py-3">{member.memberDetails?.membershipType || <span className='text-gray-400 italic'>None</span>}</td>
                      <td className="px-4 py-3">
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-1 px-3 rounded disabled:opacity-50"
                          onClick={() => handleAssign(member.id)}
                          disabled={assigningId === member.id}
                        >
                          {assigningId === member.id ? 'Assigning...' : 'Assign'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 mb-4">No members available for assignment.</p>
        )}

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
