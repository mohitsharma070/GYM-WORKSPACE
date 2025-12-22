import { useEffect, useState, useRef } from "react";
import { LayoutDashboard, Users, Dumbbell, AlertTriangle, Plus, Megaphone } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard'; // Import StatCard
import Table from '../../components/Table';
import { fetchMembersPage, createUser } from '../../api/users';
import { loadPlan, assignPlanToMember } from '../../api/subscriptions';
import { fetchAllPlans } from '../../api/plans';
import { isExpired, getDaysLeft } from '../../utils/dateUtils';
import type { Plan } from '../../types/Plan';
import { useNavigate } from "react-router-dom";
import RenewPlanModal from '../../modals/RenewPlanModal';
import AddUserModal from '../../modals/AddUserModal';
import { fetchTrainers } from "../../api/trainers";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface MemberWithPlan {
  id: number;
  name: string;
  email: string;
  plan: Plan | null;
  daysLeft: number | string;
}

export default function AdminDashboard() {
  const [members, setMembers] = useState<User[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalTrainers, setTotalTrainers] = useState(0);
  const [expiredMembers, setExpiredMembers] = useState<MemberWithPlan[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingExpired, setLoadingExpired] = useState(false);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [renewLoading, setRenewLoading] = useState(false);
  const [renewError, setRenewError] = useState<string | null>(null);
  const defaultUserObj = {
    name: "",
    email: "",
    password: "",
    fingerprint: "",
    memberDetails: {
      age: "",
      gender: "",
      height: "",
      weight: "",
      goal: "",
      membershipType: "",
      phone: "",
    },
  };
  const [newUser, setNewUser] = useState<any>(defaultUserObj);

  const navigate = useNavigate();
  const expiredSectionRef = useRef<HTMLDivElement>(null);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [membersPage, trainersPage] = await Promise.all([
        fetchMembersPage({ page: 0, size: 5, sortBy: "createdAt", sortDir: "desc" }),
        fetchTrainers({ page: 0, size: 5, sortBy: "createdAt", sortDir: "desc" }),
      ]);

      setMembers(membersPage.content);
      setTotalMembers(membersPage.totalElements);
      setTotalTrainers(trainersPage.totalElements);

    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  async function loadExpiredMembers() {
    setLoadingExpired(true);
    try {
      const pageSize = 50;
      const firstPage = await fetchMembersPage({ page: 0, size: pageSize, sortBy: "id", sortDir: "asc" });
      const allMembers = [...firstPage.content];

      if (firstPage.totalPages > 1) {
        const remainingPages = await Promise.all(
          Array.from({ length: firstPage.totalPages - 1 }, (_, idx) =>
            fetchMembersPage({
              page: idx + 1,
              size: pageSize,
              sortBy: "id",
              sortDir: "asc",
            })
          )
        );

        remainingPages.forEach((page) => {
          allMembers.push(...page.content);
        });
      }
      const membersWithPlans: MemberWithPlan[] = [];
      
      for (const member of allMembers) {
        const plan = await loadPlan(member.id);
        if (plan && plan.endDate && isExpired(plan.endDate)) {
          membersWithPlans.push({
            id: member.id,
            name: member.name,
            email: member.email,
            plan,
            daysLeft: getDaysLeft(plan.endDate)
          });
        }
      }
      
      setExpiredMembers(membersWithPlans);
    } catch (error) {
      console.error('Failed to load expired members:', error);
    } finally {
      setLoadingExpired(false);
    }
  }

  const handleRenewClick = (member: User) => {
    setSelectedMember(member);
    setRenewModalOpen(true);
  };

  const handleRenew = async (memberId: number, planId: number) => {
    setRenewLoading(true);
    setRenewError(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const ok = await assignPlanToMember(memberId, planId, today);
      if (!ok) throw new Error('Failed to renew plan.');
      setRenewModalOpen(false);
      loadExpiredMembers(); // Refresh expired list
    } catch (e: any) {
      setRenewError(e.message || 'Failed to renew plan.');
    } finally {
      setRenewLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert("Name, email, and password are required");
      return;
    }
    try {
      const payload = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        fingerprint: newUser.fingerprint,
        age: Number(newUser.memberDetails.age || 0),
        gender: newUser.memberDetails.gender,
        height: Number(newUser.memberDetails.height || 0),
        weight: Number(newUser.memberDetails.weight || 0),
        goal: newUser.memberDetails.goal,
        membershipType: newUser.memberDetails.membershipType,
        phone: newUser.memberDetails.phone,
      };
      const created = await createUser(payload);
      // Optionally assign plan if membershipType is set
      const planId = Number(newUser.memberDetails.membershipType);
      if (planId) {
        const today = new Date().toISOString().slice(0, 10);
        await assignPlanToMember(created.id, planId, today);
      }
      setShowAddUserModal(false);
      setNewUser(defaultUserObj);
      loadDashboard(); // Refresh members list
    } catch (e: any) {
      alert(e.message || 'Failed to add user');
    }
  };

  useEffect(() => {
    loadDashboard();
    loadExpiredMembers();
    fetchAllPlans().then(setAllPlans);
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
            value={totalMembers}
            icon={Users}
            description="Registered gym members"
            variant="success"
            onClick={() => navigate('/admin/users')} // Updated route for members page
          />
          <StatCard
            title="Total Trainers"
            value={totalTrainers}
            icon={Dumbbell}
            description="Certified gym trainers"
            variant="info"
            onClick={() => navigate('/admin/trainers')} // Ensure navigation works
          />
          <StatCard
            title="Expired Plans"
            value={expiredMembers.length}
            icon={AlertTriangle}
            description="Members with expired plans"
            variant="error"
            onClick={() => {
              expiredSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>
      </div>

            <div className="bg-white shadow-sm rounded-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="group bg-blue-50 border border-blue-200 p-6 rounded-lg shadow-sm hover:bg-blue-100 hover:shadow-md transition-all flex items-center space-x-4 w-full text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-full text-blue-600 group-hover:bg-blue-200 transition-colors">
                    <Plus size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">Add Member</h3>
                    <p className="text-gray-600 text-sm mt-1">Register a new gym member</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/admin/notifications/send')}
                  className="group bg-yellow-50 border border-yellow-200 p-6 rounded-lg shadow-sm hover:bg-yellow-100 hover:shadow-md transition-all flex items-center space-x-4 w-full text-left"
                >
                  <div className="p-3 bg-yellow-100 rounded-full text-yellow-600 group-hover:bg-yellow-200 transition-colors">
                    <Megaphone size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">Broadcast Notification</h3>
                    <p className="text-gray-600 text-sm mt-1">Send a message to all users</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/admin/profile')}
                  className="group bg-green-50 border border-green-200 p-6 rounded-lg shadow-sm hover:bg-green-100 hover:shadow-md transition-all flex items-center space-x-4 w-full text-left"
                >
                  <div className="p-3 bg-green-100 rounded-full text-green-600 group-hover:bg-green-200 transition-colors">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">Profile</h3>
                    <p className="text-gray-600 text-sm mt-1">View and edit your profile</p>
                  </div>
                </button>
              </div>
            </div>
      {/* Expired Plans Members */}
      <div ref={expiredSectionRef} className="bg-white shadow-sm rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <AlertTriangle className="text-red-500" size={24} />
          Members with Expired Plans
        </h2>

        {loadingExpired ? (
          <div className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        ) : expiredMembers.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-green-400 mb-3">
              <Users size={48} className="mx-auto" />
            </div>
            <p className="text-green-600 text-lg font-medium">Great! No expired plans</p>
            <p className="text-gray-400 text-sm mt-1">All active members have valid plans</p>
          </div>
        ) : (
          <Table
            headers={["#", "Member Name", "Email", "Plan Name", "Expired Since", "Actions"]}
            data={expiredMembers.slice(0, 10)}
            columnClasses={['w-1/12 text-center', 'w-3/12 text-left', 'w-4/12 text-left', 'w-2/12 text-left', 'w-2/12 text-center', 'w-2/12 text-center']}
            renderCells={(m, index) => [
              <span className="text-gray-500 font-medium">{index + 1}</span>,
              <span className="font-semibold text-gray-900">{m.name}</span>,
              <span className="text-gray-600">{m.email}</span>,
              <span className="text-gray-800">{m.plan?.name || 'N/A'}</span>,
              <span className="text-red-600 font-medium">
                {m.plan?.endDate ? new Date(m.plan.endDate).toLocaleDateString() : 'N/A'}
              </span>,
              <button
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                onClick={() => handleRenewClick({
                  id: m.id,
                  name: m.name,
                  email: m.email,
                  role: 'member', // or use actual role if available
                })}
              >
                Renew
              </button>
            ]}
            keyExtractor={(m) => m.id}
            currentPage={1} // Static for embedded table
            totalPages={1} // Static for embedded table
            onPageChange={() => {}} // No pagination needed
          />
        )}
        <RenewPlanModal
          isOpen={renewModalOpen}
          onClose={() => setRenewModalOpen(false)}
          member={selectedMember}
          plans={allPlans}
          onRenew={handleRenew}
        />
        {renewLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10">
            <div className="bg-white p-6 rounded shadow text-center">Renewing plan...</div>
          </div>
        )}
        {renewError && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10">
            <div className="bg-red-100 p-6 rounded shadow text-center text-red-700">{renewError}</div>
          </div>
        )}
        
        {expiredMembers.length > 10 && (
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-sm">
              Showing 10 of {expiredMembers.length} expired plans.
              <a href="/users" className="text-blue-600 hover:text-blue-800 ml-1">
                View all in Members page
              </a>
            </p>
          </div>
        )}
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

      {/* ADD USER MODAL */}
      {showAddUserModal && (
        <AddUserModal
          newUser={newUser}
          setNewUser={setNewUser}
          plans={allPlans}
          loading={false}
          onClose={() => setShowAddUserModal(false)}
          handleSubmit={handleAddUser}
        />
      )}
    </div>
  );
}
