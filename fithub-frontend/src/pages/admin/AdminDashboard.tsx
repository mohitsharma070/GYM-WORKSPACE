import { useEffect, useState } from "react";
import { LayoutDashboard, Users, Dumbbell, UserRound, UserCog } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard'; // Import StatCard
import Table from '../../components/Table';

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
        <PageHeader
          icon={LayoutDashboard}
          title="Admin Dashboard"
          subtitle="Overview of your gym's performance and user activities."
        />

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
      <PageHeader
        icon={LayoutDashboard}
        title="Admin Dashboard"
        subtitle="Overview of your gym's performance and user activities."
      />

      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Members"
            value={members.length}
            icon={Users}
            description="Registered gym members"
          />
          <StatCard
            title="Total Trainers"
            value={trainers.length}
            icon={Dumbbell}
            description="Certified gym trainers"
          />
          <StatCard
            title="Total Users"
            value={allUsers.length}
            icon={UserRound}
            description="All system users (members, trainers, admins)"
          />
        </div>
      </div>

            <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <a
                  href="/members"
                  className="bg-blue-50 border border-blue-200 p-5 rounded-lg shadow-sm hover:bg-blue-100 transition flex items-center space-x-3"
                >
                  <Users size={24} className="text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-lg">Manage Members</h3>
                    <p className="text-gray-600 text-sm mt-1">View and manage all members.</p>
                  </div>
                </a>
      
                <a
                  href="/trainers"
                  className="bg-green-50 border border-green-200 p-5 rounded-lg shadow-sm hover:bg-green-100 transition flex items-center space-x-3"
                >
                  <Dumbbell size={24} className="text-green-600" />
                  <div>
                    <h3 className="font-semibold text-lg">Manage Trainers</h3>
                    <p className="text-gray-600 text-sm mt-1">View and manage all trainers.</p>
                  </div>
                </a>
      
                <a
                  href="/admins"
                  className="bg-purple-50 border border-purple-200 p-5 rounded-lg shadow-sm hover:bg-purple-100 transition flex items-center space-x-3"
                >
                  <UserCog size={24} className="text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-lg">Manage Admins</h3>
                    <p className="text-gray-600 text-sm mt-1">Admin access controls.</p>
                  </div>
                </a>
              </div>
            </div>
      {/* Recent Members from available data */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Recent Members</h2>

        {members.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No members found.
          </div>
        ) : (
          <Table
            headers={["#", "Name", "Email"]}
            data={members.slice(0, 5)}
            renderRow={(m, index) => (
              <>
                <td className="p-3">{index + 1}</td>
                <td className="p-3 font-medium">{m.name}</td>
                <td className="p-3">{m.email}</td>
              </>
            )}
            keyExtractor={(m) => m.id}
            currentPage={1} // Static for embedded table
            totalPages={1} // Static for embedded table
            onPageChange={() => {}} // No pagination needed
          />
        )}
      </div>
    </div>
  );
}
