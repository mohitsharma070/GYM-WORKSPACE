import { useAttendances } from "../../hooks/useAttendance";
import { useToast } from "../../components/ToastProvider";
import type { Attendance } from "../../types/Attendance"; // Using type-only import
import { useUsers } from "../../hooks/useUsers"; // Import useUsers
import type { User } from "../../types/User"; // Import User type
import { useState } from "react"; // Import useState

export default function AttendancePage() {
  const { showToast } = useToast();
  const { allAttendancesQuery, checkIn, checkOut } = useAttendances(); // Get checkIn and checkOut mutations
  const { data: attendanceRecords = [], isLoading, isError, error } = allAttendancesQuery;

  const { data: users, isLoading: usersLoading, isError: usersError } = useUsers(); // Fetch users

  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);
  const [selectedMembershipId, setSelectedMembershipId] = useState<number | undefined>(undefined); // Assuming a user has a membership ID

  const handleManualCheckIn = async () => {
    if (selectedUserId === undefined || selectedMembershipId === undefined) {
      showToast("Please select a user and provide a membership ID.", "error");
      return;
    }
    try {
      await checkIn.mutateAsync({ userId: selectedUserId, membershipId: selectedMembershipId, fingerprintVerified: false });
      showToast("Manual check-in successful!", "success");
      setSelectedUserId(undefined);
      setSelectedMembershipId(undefined);
    } catch (err: any) {
      showToast(`Error during manual check-in: ${err.message}`, "error");
    }
  };

  const handleManualCheckOut = async () => {
    // For checkout, we would ideally need an attendance ID.
    // For simplicity, let's assume we are checking out the latest active attendance for the user.
    // In a real application, you might want a more robust way to select which attendance to check out.
    if (selectedUserId === undefined) {
      showToast("Please select a user for checkout.", "error");
      return;
    }
    try {
      // This is a simplified approach. In a real app, you might fetch active attendance for the user first.
      // For now, we'll assume the checkOut mutation can handle finding the correct attendance.
      // NOTE: The current checkOut mutation in useAttendance.ts takes an attendanceId.
      // We need to modify useAttendance.ts or assume how to get this.
      // For demonstration, let's assume a dummy attendanceId or modify checkOut.
      // Given the current checkOut signature, a direct call here for a userId is not possible.
      // This part needs adjustment or a more complex approach.
      showToast("Manual check-out not fully implemented due to API limitations.", "error");
      // await checkOut.mutateAsync(DUMMY_ATTENDANCE_ID_FOR_SELECTED_USER); // Placeholder
    } catch (err: any) {
      showToast(`Error during manual check-out: ${err.message}`, "error");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Attendance Management</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">All Attendance Records</h2>
        {isLoading ? (
          <div className="text-center text-gray-500">Loading all attendance records...</div>
        ) : isError ? (
          <div className="text-center text-red-500">Error: {error?.message || "Failed to fetch attendance records"}</div>
        ) : attendanceRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-out Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.map((record: Attendance) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.userId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.checkInTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.checkOutTime ? new Date(record.checkOutTime).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.checkOutTime ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.checkOutTime ? 'Completed' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500">No attendance records found.</div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Manual Attendance Entry</h2>
        {usersLoading ? (
          <div className="text-gray-500">Loading users...</div>
        ) : usersError ? (
          <div className="text-red-500">Error loading users.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="user-select" className="block text-sm font-medium text-gray-700">
                Select User
              </label>
              <select
                id="user-select"
                name="user-select"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
              >
                <option value="">-- Select a user --</option>
                {users?.map((user: User) => (
                  <option key={user.id} value={user.id}>
                    {user.name} (ID: {user.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="membership-id" className="block text-sm font-medium text-gray-700">
                Membership ID (for Check-in)
              </label>
              <input
                type="number"
                id="membership-id"
                name="membership-id"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedMembershipId || ''}
                onChange={(e) => setSelectedMembershipId(Number(e.target.value))}
                placeholder="Enter Membership ID"
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
              <button
                onClick={handleManualCheckIn}
                disabled={!selectedUserId || checkIn.status === 'pending'}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {checkIn.status === 'pending' ? "Checking In..." : "Manual Check-in"}
              </button>
              <button
                onClick={handleManualCheckOut}
                disabled={!selectedUserId || checkOut.status === 'pending'}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {checkOut.status === 'pending' ? "Checking Out..." : "Manual Check-out"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}