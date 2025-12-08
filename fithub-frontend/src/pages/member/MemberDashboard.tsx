import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function MemberDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProfile() {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch("http://localhost:8001/auth/me", {
        headers: { Authorization: `Basic ${token}` },
      });

      if (!res.ok) {
        setError("Failed to load user profile.");
        return;
      }

      const data = await res.json();
      setUser(data);
    } catch {
      setError("Server unreachable.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) return <p className="text-gray-600 mt-6">Loading dashboard...</p>;

  if (error)
    return (
      <div className="mt-10 text-center">
        <p className="text-red-600">{error}</p>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        {/* Active Plan */}
        <div className="bg-white shadow rounded-lg p-6 border-l-4 border-blue-600">
          <p className="text-gray-500">Active Plan</p>
          <p className="text-2xl font-bold mt-2">Basic Plan</p>
          <p className="text-gray-500 text-sm mt-1">Placeholder (no API yet)</p>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

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

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>

        <p className="text-gray-500">No recent activity found.</p>
        <p className="text-sm text-gray-400 mt-1">Placeholder — waiting for API integration.</p>
      </div>
    </div>
  );
}
