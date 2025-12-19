import { useEffect, useState } from "react";
import { useCurrentAssignedWorkoutPlanForMember } from "../../hooks/useAssignedWorkoutPlans";
import { type UserProfile } from "../../api/profile"; // Assuming UserProfile is available
import { fetchProfile } from "../../api/profile";


export default function MemberDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProfile() {
    setLoading(true);
    setError("");

    try {
      const data = await fetchProfile();
      setUser(data);
    } catch (err: any) {
      setError(err.message || "Failed to load user profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  const memberId = user?.id;
  const {
    data: assignedPlan,
    isLoading: isPlanLoading,
    isError: isPlanError,
    error: planError,
  } = useCurrentAssignedWorkoutPlanForMember(memberId || 0); // Pass 0 or null if memberId is undefined to prevent query

  if (loading || isPlanLoading) return <p className="text-gray-600 mt-6">Loading dashboard...</p>;

  if (error || isPlanError)
    return (
      <div className="mt-10 text-center">
        <p className="text-red-600">{error || planError?.message}</p>
        <button
          onClick={loadProfile}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );

  if (!user) return null;

  return (
    <div className="pb-20">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}</h1>
      <p className="text-gray-600 mb-8">Here is your fitness overview</p>

      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Your Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Plan */}
          <div className="bg-white shadow rounded-lg p-6 border-l-4 border-blue-600">
            <p className="text-gray-500">Active Plan</p>
            {assignedPlan ? (
              <>
                <p className="text-2xl font-bold mt-2">{assignedPlan.workoutPlan.name}</p>
                <p className="text-gray-500 text-sm mt-1">Difficulty: {assignedPlan.workoutPlan.difficulty}</p>
                <p className="text-gray-500 text-sm">Start Date: {assignedPlan.startDate}</p>
                {assignedPlan.endDate && <p className="text-gray-500 text-sm">End Date: {assignedPlan.endDate}</p>}
              </>
            ) : (
              <p className="text-2xl font-bold mt-2">No Active Plan</p>
            )}
          </div>

          {/* Assigned Trainer */}
          <div className="bg-white shadow rounded-lg p-6 border-l-4 border-green-600">
            <p className="text-gray-500">Assigned Trainer</p>
            <p className="text-2xl font-bold mt-2">Not Assigned</p>
            <p className="text-gray-500 text-sm mt-1">Placeholder (no API yet)</p>
          </div>

          {/* Schedule Count */}
          <div className="bg-white shadow rounded-lg p-6 border-l-4 border-purple-600">
            <p className="text-gray-500">Upcoming Sessions</p>
            <p className="text-2xl font-bold mt-2">0</p>
            <p className="text-gray-500 text-sm mt-1">Placeholder</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => alert("Opening plans…")}
            className="cursor-pointer bg-blue-50 border border-blue-200 p-5 rounded-lg hover:bg-blue-100 transition"
          >
            <h3 className="font-semibold text-lg">Explore Plans</h3>
            <p className="text-gray-600 text-sm mt-1">
              View all available membership plans.
            </p>
          </div>

          <div
            onClick={() => alert("Opening subscriptions…")}
            className="cursor-pointer bg-green-50 border border-green-200 p-5 rounded-lg hover:bg-green-100 transition"
          >
            <h3 className="font-semibold text-lg">My Subscription</h3>
            <p className="text-gray-600 text-sm mt-1">
              Check your active subscription.
            </p>
          </div>

          <div
            onClick={() => alert("Opening schedule…")}
            className="cursor-pointer bg-purple-50 border border-purple-200 p-5 rounded-lg hover:bg-purple-100 transition"
          >
            <h3 className="font-semibold text-lg">Schedule</h3>
            <p className="text-gray-600 text-sm mt-1">
              View your upcoming workout sessions.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>

        <p className="text-gray-500">No recent activity found.</p>
        <p className="text-sm text-gray-400 mt-1">Placeholder — waiting for API integration.</p>
      </div>
    </div>
  );
}
