import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { type UserProfile, fetchProfile } from "../../api/profile";
import { useAllWorkoutPlans } from "../../hooks/useWorkoutPlans";
import {
  useCurrentAssignedWorkoutPlanForMember,
  useCancelAssignedWorkoutPlan,
} from "../../hooks/useAssignedWorkoutPlans";


import AssignWorkoutPlanModal from "../../modals/AssignWorkoutPlanModal"; // Will create this modal


interface Client {
  id: number;
  name: string;
  email: string;
}

export default function ClientsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [errorUser, setErrorUser] = useState<string | null>(null);
  const [showAssignPlanModal, setShowAssignPlanModal] = useState(false);
  const [selectedClientForPlan, setSelectedClientForPlan] = useState<number | null>(null);

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

  const trainerId = user?.id; // Get trainerId from authenticated user

  // Fetch all members that are clients of this trainer (assuming an API endpoint exists)
  // For now, re-using the existing /auth/trainer/members endpoint
  const {
    data: clients,
    isLoading: isLoadingClients,
    isError: isErrorClients,
    error: clientsError,
    refetch: refetchClients,
  } = useQuery<Client[], Error>({
    queryKey: ["trainerClients", trainerId],
    queryFn: async () => {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:8001/auth/trainer/members", {
        headers: { Authorization: `Basic ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch clients");
      return res.json();
    },
    enabled: !!trainerId,
  });

  // Fetch all workout plans created by this trainer, or all active plans
  const { data: allWorkoutPlans } = useAllWorkoutPlans(trainerId); // Fetch plans created by this trainer


  if (loadingUser || isLoadingClients) {
    return <p className="text-gray-600 mt-6">Loading clients...</p>;
  }

  if (errorUser || isErrorClients) {
    return (
      <div className="mt-10 text-center">
        <p className="text-red-600">{errorUser || clientsError?.message}</p>
        <button
          onClick={() => { refetchClients(); }}
          className="px-5 py-2 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Title */}
      <h1 className="text-3xl font-bold mb-6">My Clients</h1>

      {/* Table */}
      <div className="bg-white shadow rounded-lg p-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients && clients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  No clients found.
                </td>
              </tr>
            ) : (
              clients?.map((client, index) => (
                <ClientRow
                  key={client.id}
                  client={client}
                  index={index}
                  onAssignPlanClick={() => {
                    setSelectedClientForPlan(client.id);
                    setShowAssignPlanModal(true);
                  }}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAssignPlanModal && selectedClientForPlan && (
        <AssignWorkoutPlanModal
          isOpen={showAssignPlanModal}
          onClose={() => {
            setShowAssignPlanModal(false);
            setSelectedClientForPlan(null);
          }}
          onAssign={(planId, startDate) => {
            // This is handled by a mutation inside ClientRow or a dedicated mutation here.
            // For simplicity, passing directly for now.
            console.log(`Assigning plan ${planId} to client ${selectedClientForPlan} starting ${startDate}`);
          }}
          memberId={selectedClientForPlan}
          trainerId={trainerId!}
          availableWorkoutPlans={allWorkoutPlans || []}
        />
      )}
    </div>
  );
}

// --- ClientRow Component ---
interface ClientRowProps {
  client: Client;
  index: number;
  onAssignPlanClick: () => void;
}

function ClientRow({ client, index, onAssignPlanClick }: ClientRowProps) {
  const {
    data: currentAssignedPlan,
    isLoading: isLoadingAssignedPlan,
    refetch: refetchAssignedPlan,
  } = useCurrentAssignedWorkoutPlanForMember(client.id);

  const cancelPlanMutation = useCancelAssignedWorkoutPlan();

  const handleCancelPlan = async () => {
    if (!currentAssignedPlan || !confirm("Are you sure you want to cancel this assigned plan?")) {
      return;
    }
    try {
      await cancelPlanMutation.mutateAsync(currentAssignedPlan.id);
      alert("Assigned plan cancelled successfully!");
      refetchAssignedPlan();
    } catch (err: any) {
      alert(`Failed to cancel plan: ${err.message}`);
    }
  };


  return (
    <>
      <tr className="border-b hover:bg-gray-50 transition">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.name}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {isLoadingAssignedPlan ? (
            "Loading..."
          ) : currentAssignedPlan ? (
            `${currentAssignedPlan.workoutPlan.name} (${currentAssignedPlan.status})`
          ) : (
            "No Active Plan"
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex gap-2">
            <button
              onClick={onAssignPlanClick}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Assign Plan
            </button>
            {currentAssignedPlan && (
              <button
                onClick={handleCancelPlan}
                disabled={cancelPlanMutation.isPending}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Cancel Plan
              </button>
            )}
            {/* Add button to view workout logs */}
          </div>
        </td>
      </tr>
      {/* Expandable row for workout logs can be added here */}
    </>
  );
}