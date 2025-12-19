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
      <div className="mt-10 animate-pulse text-center">
        <div className="h-32 w-32 bg-gray-200 rounded-full mx-auto"></div>
        <div className="h-6 bg-gray-200 rounded mt-6 w-48 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded mt-3 w-72 mx-auto"></div>
      </div>
    );
  }

  // ERROR
  if (error || !user) {
    return (
      <div className="mt-10 text-center">
        <p className="text-red-600">
          {(error as Error)?.message || "Failed to load profile"}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // PROFILE UI
  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow-md rounded-xl p-8">
      <PageHeader
        icon={UserRound}
        title="My Profile"
        subtitle="View and manage your personal information."
        actions={
          <div className="flex gap-4">
            <button
              onClick={() => alert("Edit Profile Coming Soon")}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
            >
              Edit Profile
            </button>

            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="px-5 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        }
      />

      {/* AVATAR */}
      <div className="flex justify-center mb-6">
        <div className="h-32 w-32 bg-blue-600 shadow-lg text-white text-5xl rounded-full flex items-center justify-center">
          {user.name.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* NAME + EMAIL */}
      <h2 className="text-2xl font-semibold text-center mb-1">{user.name}</h2>
      <p className="text-gray-600 text-center mb-6">{user.email}</p>

      {/* INFO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-xl bg-gray-50">
          <p className="text-gray-600 text-sm">Role</p>
          <span className="mt-1 inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            {user.role.toUpperCase()}
          </span>
        </div>

        <div className="p-4 border rounded-xl bg-gray-50">
          <p className="text-gray-600 text-sm">User ID</p>
          <p className="font-semibold text-gray-800 mt-1">{user.id}</p>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={() => alert("Edit Profile Coming Soon")}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          Edit Profile
        </button>

        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="px-5 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
