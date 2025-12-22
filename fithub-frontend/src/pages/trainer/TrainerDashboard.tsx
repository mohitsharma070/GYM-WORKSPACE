import { useEffect, useState } from "react";
import { Plus } from 'lucide-react';
import { Button } from '../../components/Button';
import { useAllWorkoutPlans } from "../../hooks/useWorkoutPlans";
import { type UserProfile } from "../../api/profile";
import { fetchProfile } from "../../api/profile";
import { fetchTrainerMembersPage } from "../../api/users";
import type { SortDirection, UserSortBy } from "../../types/Page";

interface Member {
  id: number;
  name: string;
  email: string;
}

export default function TrainerDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [errorUser, setErrorUser] = useState<string | null>(null);

  async function loadProfile() {
    setLoadingUser(true);
    setErrorUser(null);
    try {
      const data = await fetchProfile();
      setUser(data);
    } catch (err: any) {
      setErrorUser(err.message || "Failed to load user profile.");
    } finally {
      setLoadingUser(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  const trainerId = user?.id; // Get trainerId from authenticated user

  const {
    data: createdPlans,
    isLoading: isLoadingPlans,
    isError: isErrorPlans,
    error: plansError,
  } = useAllWorkoutPlans(trainerId || 0);

  const [members, setMembers] = useState<Member[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [errorMembers, setErrorMembers] = useState("");
  const sortBy: UserSortBy = "name";
  const sortDir: SortDirection = "asc";

  async function loadClientsData() {
    setLoadingMembers(true);
    setErrorMembers("");

    try {
      const data = await fetchTrainerMembersPage({
        page: 0,
        size: 10,
        sortBy,
        sortDir,
      });
      setMembers(data.content);
      setTotalMembers(data.totalElements);
    } catch (err: any) {
      setErrorMembers(err?.message || "Server unreachable.");
    } finally {
      setLoadingMembers(false);
    }
  }

  useEffect(() => {
    loadClientsData();
  }, []);

  if (loadingUser || loadingMembers || isLoadingPlans) {
    return <p className="text-gray-600 mt-8">Loading trainer dashboard...</p>;
  }

  if (errorUser || errorMembers || isErrorPlans) {
    return (
      <div className="mt-10">
        <p className="text-red-600">
          {errorUser || errorMembers || plansError?.message}
        </p>
        <Button
          onClick={() => { loadProfile(); loadClientsData(); }}
        >
          <Plus size={18} className="mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Title */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Trainer Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Total Clients */}
        <div className="bg-white shadow rounded-lg p-6 border-l-4 border-blue-600">
          <p className="text-gray-500">Total Clients</p>
          <p className="text-3xl font-bold mt-2">{totalMembers}</p>
        </div>

        {/* Created Workout Plans */}
        <div className="bg-white shadow rounded-lg p-6 border-l-4 border-purple-600">
          <p className="text-gray-500">Created Plans</p>
          <p className="text-3xl font-bold mt-2">{createdPlans?.length || 0}</p>
        </div>

        {/* Today's Sessions (Placeholder for now) */}
        <div className="bg-white shadow rounded-lg p-6 border-l-4 border-green-600">
          <p className="text-gray-500">Today's Sessions</p>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
      </div>

      {/* Quick Links / Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <a
          onClick={() => alert("Schedule feature coming soon")}
          className="bg-blue-50 border border-blue-200 p-5 rounded-lg hover:bg-blue-100 cursor-pointer transition"
        >
          <h3 className="font-semibold text-lg">View Schedule</h3>
          <p className="text-gray-600 text-sm mt-1">
            Check all your booked sessions.
          </p>
        </a>

        <a
          onClick={() => alert("Workout plan feature coming soon")}
          className="bg-green-50 border border-green-200 p-5 rounded-lg hover:bg-green-100 cursor-pointer transition"
        >
          <h3 className="font-semibold text-lg">Create Workout Plan</h3>
          <p className="text-gray-600 text-sm mt-1">
            Build personalized plans for clients.
          </p>
        </a>

        <a
          onClick={() => alert("Diet plan feature coming soon")}
          className="bg-purple-50 border border-purple-200 p-5 rounded-lg hover:bg-purple-100 cursor-pointer transition"
        >
          <h3 className="font-semibold text-lg">Create Diet Plan</h3>
          <p className="text-gray-600 text-sm mt-1">
            Deliver diet charts to your members.
          </p>
        </a>
      </div>

      {/* Clients List */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Your Clients</h2>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-gray-100 text-left">
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
            </tr>
          </thead>

          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-gray-500">
                  No clients assigned yet.
                </td>
              </tr>
            ) : (
              members.map((m, i) => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3">{m.name}</td>
                  <td className="p-3">{m.email}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}