// src/pages/admin/ProfilePage.tsx

import { useProfile } from "../../hooks/useProfile";
import { UserRound } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function ProfilePage() {
  const profileQuery = useProfile();

  const { data: user, error, isLoading, refetch } = profileQuery;

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

      <div className="max-w-2xl mx-auto bg-white shadow-sm rounded-lg p-8">

        {/* AVATAR */}
        <div className="flex justify-center mb-8">
          <div className="h-32 w-32 bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg text-white text-5xl rounded-full flex items-center justify-center">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* NAME + EMAIL */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">{user.name}</h2>
          <p className="text-gray-600 text-lg">{user.email}</p>
        </div>

        {/* INFO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-gray-500 text-sm font-medium mb-2">Role</p>
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {user.role.toUpperCase()}
            </span>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-gray-500 text-sm font-medium mb-2">User ID</p>
            <p className="font-semibold text-gray-900 text-lg">{user.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
