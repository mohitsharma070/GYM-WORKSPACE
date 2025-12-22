import { useState, useEffect } from "react";
import { Plus } from 'lucide-react';
import { Button } from '../../components/Button';
import { useQuery } from "@tanstack/react-query";

import { type UserProfile, fetchProfile } from "../../api/profile";
import { useAllWorkoutPlans } from "../../hooks/useWorkoutPlans";
import {
  useCurrentAssignedWorkoutPlanForMember,
  useCancelAssignedWorkoutPlan,
} from "../../hooks/useAssignedWorkoutPlans";
import Table from "../../components/Table";
import AssignWorkoutPlanModal from "../../modals/AssignWorkoutPlanModal";

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

  /* SEARCH AND PAGINATION STATE */
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10; // You can adjust this number

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

  /* FILTER AND PAGINATE CLIENTS */
  const filteredClients = clients?.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  if (loadingUser || isLoadingClients) {
    return <p className="text-gray-600 mt-6">Loading clients...</p>;
  }

  if (errorUser || isErrorClients) {
    return (
      <div className="mt-10 text-center">
        <p className="text-red-600">{errorUser || clientsError?.message}</p>
        <Button
          onClick={() => { refetchClients(); }}
        >
          <Plus size={18} className="mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Title */}
      <h1 className="text-3xl font-bold mb-6">My Clients</h1>

      {/* Table */}
      <div className="bg-white shadow rounded-lg p-6 overflow-x-auto">
        {isLoadingClients ? (
          <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">Loading clients...</div>
        ) : isErrorClients ? (
          <div className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-center">Failed to load clients</div>
        ) : paginatedClients.length === 0 ? (
          <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No clients found.</div>
        ) : (
          <Table
            headers={["#", "Name", "Email", "Assigned Plan", "Actions"]}
            columnClasses={['w-1/12 text-center', 'w-2/12', 'w-3/12', 'w-3/12', 'w-3/12 text-center']}
            data={paginatedClients}
            renderCells={(client, index) => {
              const {
                data: currentAssignedPlan,
                isLoading: isLoadingAssignedPlan,
                refetch: refetchAssignedPlan,
              } = useCurrentAssignedWorkoutPlanForMember(client.id);

              const cancelPlanMutation = useCancelAssignedWorkoutPlan();

              const handleCancelPlan = async (e: React.MouseEvent) => {
                e.stopPropagation();
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

              return [
                index + 1 + (currentPage - 1) * itemsPerPage,
                <span className="font-medium">{client.name}</span>,
                client.email,
                isLoadingAssignedPlan ? (
                  "Loading..."
                ) : currentAssignedPlan ? (
                  `${currentAssignedPlan.workoutPlan.name} (${currentAssignedPlan.status})`
                ) : (
                  "No Active Plan"
                ),
                <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClientForPlan(client.id);
                      setShowAssignPlanModal(true);
                    }}
                  >
                    <Plus size={14} className="mr-1" /> Assign Plan
                  </Button>
                  {currentAssignedPlan && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleCancelPlan}
                      disabled={cancelPlanMutation.isPending}
                    >
                      Cancel Plan
                    </Button>
                  )}
                </div>,
              ];
            }}
            keyExtractor={(client) => client.id}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            searchPlaceholder="Search clients by name or email..."
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        )}
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