import { useEffect, useState } from "react";

interface Member {
  id: number;
  name: string;
  email: string;
}

export default function TrainerDashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTrainerData() {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch("http://localhost:8001/auth/trainer/members", {
        headers: {
          Authorization: `Basic ${token}`,
        },
      });

      if (!res.ok) {
        setError("Failed to load trainer data.");
        return;
      }

      const data = await res.json();
      setMembers(data);
    } catch {
      setError("Server unreachable.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrainerData();
  }, []);

  if (loading) {
    return <p className="text-gray-600 mt-8">Loading trainer dashboard...</p>;
  }

  if (error) {
    return (
      <div className="mt-10">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadTrainerData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

        {/* Total Clients */}
        <div className="bg-white shadow rounded-lg p-6 border-l-4 border-blue-600">
          <p className="text-gray-500">Total Clients</p>
          <p className="text-3xl font-bold mt-2">{members.length}</p>
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
