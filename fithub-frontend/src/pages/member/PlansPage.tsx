import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllPlans } from "../../api/plans"; // For membership plans
import { useSubscriptions } from "../../hooks/useSubscriptions"; // For membership subscription
import { useAllWorkoutPlans, useAssignWorkoutPlan } from "../../hooks/useWorkoutPlans"; // For workout plans
import { Dumbbell } from "lucide-react";
import { type Plan as MembershipPlan } from "../../types/Plan"; // Renamed for clarity
import { useAuth } from "../../hooks/useAuth"; // For membership subscription
import { useToast } from "../../components/ToastProvider"; // Import useToast
import Table from "../../components/Table";


export default function PlansPage({ onPageChange }: { onPageChange: (page: string) => void }) {
  const { memberId } = useAuth(); // Get memberId from authenticated user

  /* SEARCH AND PAGINATION STATE FOR MEMBERSHIP PLANS */
  const [membershipSearchTerm, setMembershipSearchTerm] = useState<string>("");
  const [membershipCurrentPage, setMembershipCurrentPage] = useState<number>(1);
  const membershipItemsPerPage = 5; // You can adjust this number

  // Membership Plans
  const {
    data: membershipPlans,
    isLoading: isLoadingMembershipPlans,
    isError: isErrorMembershipPlans,
    error: membershipPlansError,
  } = useQuery<MembershipPlan[], Error>({
    queryKey: ["membershipPlans"],
    queryFn: fetchAllPlans,
  });

  const {
    subscribe,
    loading: subscribingMembership,
    error: subscribeMembershipError,
  } = useSubscriptions();

  /* FILTER AND PAGINATE MEMBERSHIP PLANS */
  const filteredMembershipPlans = membershipPlans?.filter(plan =>
    plan.name.toLowerCase().includes(membershipSearchTerm.toLowerCase())
  ) || [];

  const membershipTotalPages = Math.ceil(filteredMembershipPlans.length / membershipItemsPerPage);
  const paginatedMembershipPlans = filteredMembershipPlans.slice(
    (membershipCurrentPage - 1) * membershipItemsPerPage,
    membershipCurrentPage * membershipItemsPerPage
  );

  // Workout Plans
  const {
    data: workoutPlans,
    isLoading: isLoadingWorkoutPlans,
    isError: isErrorWorkoutPlans,
    error: workoutPlansError,
  } = useAllWorkoutPlans();

  const assignWorkoutPlanMutation = useAssignWorkoutPlan();
  const { showToast } = useToast(); // Initialize useToast

  async function handleSubscribeMembership(planId: number) {
    if (!memberId) {
      showToast("User not logged in or member ID not available.", "error");
      return;
    }
    const success = await subscribe(memberId, planId);
    if (success) {
      showToast("Action completed. Notification sent.", "success");
    } else {
      showToast(`Failed to subscribe to membership plan: ${subscribeMembershipError}`, "error");
    }
  }

  async function handleAssignWorkoutPlan(planId: number) {
    if (!memberId) {
      showToast("User not logged in or member ID not available.", "error");
      return;
    }

    try {
      // Assuming startDate is current date, endDate is optional
      // Placeholder for assignedByTrainerId as it's not readily available here.
      // In a real app, this would come from the authenticated trainer's ID.
      const assignedByTrainerId = 1; // Example: A default or specific trainer ID

      await assignWorkoutPlanMutation.mutateAsync({
        memberId: memberId,
        planId: planId,
        assignedByTrainerId: assignedByTrainerId,
        startDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        status: "ACTIVE", // Default status
      });
      showToast("Action completed. Notification sent.", "success");
    } catch (err: any) {
      showToast(`Failed to assign workout plan: ${err.message}`, "error");
    }
  }

  // Convert days into months + days
  function formatDuration(days: number) {
    const months = Math.floor(days / 30);
    const remDays = days % 30;

    if (months > 0 && remDays > 0) return `${months} months ${remDays} days`;
    if (months > 0) return `${months} months`;
    return `${remDays} days`;
  }

  if (isLoadingMembershipPlans || isLoadingWorkoutPlans) {
    return (
      <div className="mt-10">
        <h1 className="text-3xl font-bold">Plans</h1>
        <div className="space-y-3 animate-pulse mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isErrorMembershipPlans || isErrorWorkoutPlans) {
    return (
      <div className="mt-10">
        <p className="text-red-600 text-lg">
          Error:{" "}
          {membershipPlansError?.message || workoutPlansError?.message}
        </p>
        <button
          onClick={() => { /* Refetch queries */ }}
          className="px-4 py-2 mt-4 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Membership Plans Section */}
      <h1 className="text-3xl font-bold mb-6">Membership Plans</h1>
      <div className="bg-white shadow rounded-lg p-6 overflow-x-auto mb-10">
        {isLoadingMembershipPlans ? (
          <div className="p-5 text-center text-gray-500">Loading membership plans...</div>
        ) : isErrorMembershipPlans ? (
          <div className="p-5 text-center text-red-600">Failed to load membership plans</div>
        ) : paginatedMembershipPlans.length === 0 ? (
          <div className="p-5 text-center text-gray-600">No membership plans available.</div>
        ) : (
          <Table
            headers={["#", "Plan Name", "Price (₹)", "Duration", "Actions"]}
            columnClasses={['w-1/12 text-center', 'w-3/12', 'w-2/12', 'w-3/12', 'w-3/12 text-center']}
            data={paginatedMembershipPlans}
            renderCells={(p, index) => [
              index + 1 + (membershipCurrentPage - 1) * membershipItemsPerPage,
              <span className="font-medium">{p.name}</span>,
              <span className="font-semibold text-green-700">₹{p.price}</span>,
              <span className="flex items-center gap-2">
                {formatDuration(p.durationDays)}
              </span>,
              <button
                onClick={() => handleSubscribeMembership(p.id)}
                disabled={subscribingMembership}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                {subscribingMembership ? "Subscribing..." : "Subscribe"}
              </button>,
            ]}
            keyExtractor={(p) => p.id}
            currentPage={membershipCurrentPage}
            totalPages={membershipTotalPages}
            onPageChange={setMembershipCurrentPage}
            searchPlaceholder="Search membership plans by name..."
            searchTerm={membershipSearchTerm}
            onSearchChange={setMembershipSearchTerm}
          />
        )}
      </div>

      {/* Workout Plans Section */}
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <Dumbbell size={30} /> Available Workout Plans
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workoutPlans && workoutPlans.length === 0 && (
          <p className="col-span-full text-gray-600">No workout plans available.</p>
        )}
        {workoutPlans?.map((plan) => (
          <div key={plan.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
            <p className="text-gray-600 mb-3">{plan.description}</p>
            <p className="text-sm text-gray-500">Difficulty: {plan.difficulty}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => onPageChange(`workout-plan-details-${plan.id}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                View Plan
              </button>
              <button
                onClick={() => handleAssignWorkoutPlan(plan.id)}
                disabled={assignWorkoutPlanMutation.isPending}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400"
              >
                {assignWorkoutPlanMutation.isPending ? "Assigning..." : "Assign This Plan"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}