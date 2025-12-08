import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const [members, setMembers] = useState<User[]>([]);
  const [trainers, setTrainers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Authentication token missing. Please login again.");
        return;
      }

      const headers = { Authorization: `Basic ${token}` };

      const [membersRes, trainersRes, allRes] = await Promise.all([
        fetch("http://localhost:8001/auth/admin/members", { headers }),
        fetch("http://localhost:8001/auth/admin/trainers", { headers }),
        fetch("http://localhost:8001/auth/admin/all", { headers }),
      ]);

      if (!membersRes.ok || !trainersRes.ok || !allRes.ok) {
        setError("Failed to load dashboard data.");
        return;
      }

      setMembers(await membersRes.json());
      setTrainers(await trainersRes.json());
      setAllUsers(await allRes.json());

    } catch {
      setError("Server unreachable.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="mt-10">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

        <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadDashboard}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6 border-l-4 border-blue-600">
          <p className="text-gray-600">Total Members</p>
          <p className="text-3xl font-bold mt-2">{members.length}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 border-l-4 border-green-600">
          <p className="text-gray-600">Total Trainers</p>
          <p className="text-3xl font-bold mt-2">{trainers.length}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 border-l-4 border-purple-600">
          <p className="text-gray-600">Total Users</p>
          <p className="text-3xl font-bold mt-2">{allUsers.length}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <a
          href="/members"
          className="bg-blue-50 border border-blue-200 p-5 rounded-lg hover:bg-blue-100 transition"
        >
          <h3 className="font-semibold text-lg">Manage Members</h3>
          <p className="text-gray-600 text-sm mt-1">View and manage all members.</p>
        </a>

        <a
          href="/trainers"
          className="bg-green-50 border border-green-200 p-5 rounded-lg hover:bg-green-100 transition"
        >
          <h3 className="font-semibold text-lg">Manage Trainers</h3>
          <p className="text-gray-600 text-sm mt-1">View and manage all trainers.</p>
        </a>

        <a
          href="/admins"
          className="bg-purple-50 border border-purple-200 p-5 rounded-lg hover:bg-purple-100 transition"
        >
          <h3 className="font-semibold text-lg">Manage Admins</h3>
          <p className="text-gray-600 text-sm mt-1">Admin access controls.</p>
        </a>
      </div>

      {/* Recent Members from available data */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Recent Members</h2>

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
                  No members found.
                </td>
              </tr>
            ) : (
              members.slice(0, 5).map((m, index) => (
                <tr key={m.id} className="border-b hover:bg-gray-100">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3 font-medium">{m.name}</td>
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
