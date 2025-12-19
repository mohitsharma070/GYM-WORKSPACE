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
      <div className="space-y-8">
        <PageHeader
          icon={LayoutDashboard}
          title="Admin Dashboard"
          subtitle="Overview of your gym's performance and user activities."
        />

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <PageHeader
          icon={LayoutDashboard}
          title="Admin Dashboard"
          subtitle="Overview of your gym's performance and user activities."
        />
        
        <div className="bg-white rounded-lg p-8 shadow-sm text-center">
          <div className="max-w-md mx-auto">
            <p className="text-red-600 text-lg font-medium mb-4">{error}</p>
            <button
              onClick={loadDashboard}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        icon={LayoutDashboard}
        title="Admin Dashboard"
        subtitle="Overview of your gym's performance and user activities."
      />

      <div className="bg-white shadow-sm rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard Overview</h2>
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

            <div className="bg-white shadow-sm rounded-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <a
                  href="/members"
                  className="group bg-blue-50 border border-blue-200 p-6 rounded-lg shadow-sm hover:bg-blue-100 hover:shadow-md transition-all flex items-center space-x-4"
                >
                  <div className="p-3 bg-blue-100 rounded-full text-blue-600 group-hover:bg-blue-200 transition-colors">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">Manage Members</h3>
                    <p className="text-gray-600 text-sm mt-1">View and manage all members</p>
                  </div>
                </a>
      
                <a
                  href="/trainers"
                  className="group bg-green-50 border border-green-200 p-6 rounded-lg shadow-sm hover:bg-green-100 hover:shadow-md transition-all flex items-center space-x-4"
                >
                  <div className="p-3 bg-green-100 rounded-full text-green-600 group-hover:bg-green-200 transition-colors">
                    <Dumbbell size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">Manage Trainers</h3>
                    <p className="text-gray-600 text-sm mt-1">View and manage all trainers</p>
                  </div>
                </a>
      
                <a
                  href="/admins"
                  className="group bg-purple-50 border border-purple-200 p-6 rounded-lg shadow-sm hover:bg-purple-100 hover:shadow-md transition-all flex items-center space-x-4"
                >
                  <div className="p-3 bg-purple-100 rounded-full text-purple-600 group-hover:bg-purple-200 transition-colors">
                    <UserCog size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">Manage Admins</h3>
                    <p className="text-gray-600 text-sm mt-1">Admin access controls</p>
                  </div>
                </a>
              </div>
            </div>
      {/* Recent Members from available data */}
      <div className="bg-white shadow-sm rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Members</h2>

        {members.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-3">
              <Users size={48} className="mx-auto" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No members found</p>
            <p className="text-gray-400 text-sm mt-1">Members will appear here once registered</p>
          </div>
        ) : (
          <Table
            headers={["#", "Name", "Email"]}
            data={members.slice(0, 5)}
            columnClasses={['w-1/12 text-center', 'w-4/12 text-left', 'w-7/12 text-left']}
            renderCells={(m, index) => [
              <span className="text-gray-500 font-medium">{index + 1}</span>,
              <span className="font-semibold text-gray-900">{m.name}</span>,
              <span className="text-gray-600">{m.email}</span>,
            ]}
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
