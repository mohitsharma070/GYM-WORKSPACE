// src/pages/admin/ProfilePage.tsx

import { useProfile } from "../../hooks/useProfile";
import { UserRound, Shield, Clock, Calendar, Activity } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';

export default function ProfilePage() {
  const profileQuery = useProfile();

  const { data: user, error, isLoading, refetch } = profileQuery;

  // Profile statistics
  const lastLoginTime = new Date().toLocaleDateString();
  const profileCompletion = user ? (user.name && user.email && user.role ? 100 : 75) : 0;
  const securityLevel = user?.role === 'ADMIN' ? 'High' : 'Standard';

  // LOADING
  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader
          icon={UserRound}
          title="My Profile"
          subtitle="View and manage your personal information."
        />
        
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <div className="animate-pulse text-center space-y-6">
            <div className="h-32 w-32 bg-gray-200 rounded-full mx-auto"></div>
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded w-48 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-72 mx-auto"></div>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ERROR
  if (error || !user) {
    return (
      <div className="space-y-8">
        <PageHeader
          icon={UserRound}
          title="My Profile"
          subtitle="View and manage your personal information."
        />
        
        <div className="bg-white rounded-lg p-8 shadow-sm text-center">
          <div className="max-w-md mx-auto">
            <p className="text-red-600 text-lg font-medium mb-4">
              {(error as Error)?.message || "Failed to load profile"}
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PROFILE UI
  return (
    <div className="space-y-8">
      <PageHeader
        icon={UserRound}
        title="My Profile"
        subtitle="View and manage your personal information."
        actions={
          <div className="flex gap-3">
            <button
              onClick={() => alert("Edit Profile Coming Soon")}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              Edit Profile
            </button>

            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              Logout
            </button>
          </div>
        }
      />

      {/* Profile Statistics Dashboard */}
      {user && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Account Status"
            value="Active"
            icon={Activity}
            variant="success"
            description="Account active"
          />
          <StatCard
            title="Security Level"
            value={securityLevel}
            icon={Shield}
            variant={user.role === 'ADMIN' ? "error" : "info"}
            description="Access privileges"
          />
          <StatCard
            title="Profile Complete"
            value={`${profileCompletion}%`}
            icon={UserRound}
            variant="default"
            description="Profile information"
          />
          <StatCard
            title="Last Login"
            value="Today"
            icon={Clock}
            variant="warning"
            description={lastLoginTime}
          />
        </div>
      )}

      <div className="max-w-2xl mx-auto bg-gradient-to-br from-white to-gray-50 shadow-sm rounded-lg p-8 border">

        {/* AVATAR */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="h-32 w-32 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-xl text-white text-5xl rounded-full flex items-center justify-center ring-4 ring-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* NAME + EMAIL */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">{user.name}</h2>
          <p className="text-gray-600 text-lg mb-3">{user.email}</p>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700">Member since {new Date().getFullYear()}</span>
          </div>
        </div>

        {/* INFO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-gray-200 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-gray-600 text-sm font-medium">Role</p>
            </div>
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-sm font-semibold border border-blue-300">
              {user.role.toUpperCase()}
            </span>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-slate-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <UserRound className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-gray-600 text-sm font-medium">User ID</p>
            </div>
            <p className="font-mono font-semibold text-gray-900 text-lg bg-gray-100 px-3 py-2 rounded-md border">{user.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
