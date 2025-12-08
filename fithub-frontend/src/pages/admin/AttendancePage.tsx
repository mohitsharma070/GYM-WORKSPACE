import { useState } from "react";
import { useAttendances } from "../../hooks/useAttendance";
import type { Attendance } from "../../types/Attendance";

export default function AttendancePage() {
  const { allAttendancesQuery, checkIn, checkOut } = useAttendances();
  const { data: attendances, isLoading, isError, error } = allAttendancesQuery;

  const [userId, setUserId] = useState<string>("");
  const [membershipId, setMembershipId] = useState<string>("");
  const [fingerprintVerified, setFingerprintVerified] = useState<boolean>(false);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !membershipId) {
      alert("Please enter both User ID and Membership ID for check-in.");
      return;
    }
    try {
      await checkIn.mutateAsync({
        userId: Number(userId),
        membershipId: Number(membershipId),
        fingerprintVerified,
      });
      setUserId("");
      setMembershipId("");
      setFingerprintVerified(false);
      alert("Check-in successful!");
    } catch (err: any) {
      alert(`Check-in failed: ${err.message}`);
    }
  };

  const handleCheckOut = async (attendanceId: number) => {
    try {
      await checkOut.mutateAsync(attendanceId);
      alert("Check-out successful!");
    } catch (err: any) {
      alert(`Check-out failed: ${err.message}`);
    }
  };

  if (isLoading) return <div>Loading attendances...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Attendance Management</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">New Check-in</h2>
        <form onSubmit={handleCheckIn} className="space-y-4">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
              User ID
            </label>
            <input
              type="number"
              id="userId"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="membershipId" className="block text-sm font-medium text-gray-700">
              Membership ID
            </label>
            <input
              type="number"
              id="membershipId"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={membershipId}
              onChange={(e) => setMembershipId(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="fingerprintVerified"
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              checked={fingerprintVerified}
              onChange={(e) => setFingerprintVerified(e.target.checked)}
            />
            <label htmlFor="fingerprintVerified" className="ml-2 block text-sm text-gray-900">
              Fingerprint Verified
            </label>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={checkIn.isPending}
          >
            {checkIn.isPending ? "Checking In..." : "Check In"}
          </button>
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">All Attendance Records</h2>
        {attendances && attendances.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Membership ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-out Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fingerprint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendances.map((attendance: Attendance) => (
                  <tr key={attendance.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {attendance.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {attendance.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {attendance.membershipId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(attendance.checkInTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {attendance.checkOutTime ? new Date(attendance.checkOutTime).toLocaleString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {attendance.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {attendance.fingerprintVerified ? "Yes" : "No"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!attendance.checkOutTime && (
                        <button
                          onClick={() => handleCheckOut(attendance.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                          disabled={checkOut.isPending}
                        >
                          {checkOut.isPending ? "Checking Out..." : "Check Out"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No attendance records found.</p>
        )}
      </div>
    </div>
  );
}
