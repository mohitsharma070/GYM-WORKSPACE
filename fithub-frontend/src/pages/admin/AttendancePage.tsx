import { useAttendances } from "../../hooks/useAttendance";
import { useToast } from "../../components/ToastProvider";
import type { Attendance } from "../../types/Attendance"; // Using type-only import
import { useUsers } from "../../hooks/useUsers"; // Import useUsers
import type { User } from "../../types/User"; // Import User type
import { useState, useMemo } from "react"; // Import useState and useMemo
import { CalendarCheck, CalendarOff } from 'lucide-react'; // Import the icon
import PageHeader from '../../components/PageHeader'; // Import PageHeader
import EmptyState from "../../components/EmptyState"; // Import EmptyState
import Table from "../../components/Table";

export default function AttendancePage() {
  const { showToast } = useToast();
  const { allAttendancesQuery, checkIn, checkOut } = useAttendances(); // Get checkIn and checkOut mutations
  const { data: attendanceRecords = [], isLoading, isError, error } = allAttendancesQuery;

  const { data: users, isLoading: usersLoading, isError: usersError } = useUsers(); // Fetch users

  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);
  const [selectedMembershipId, setSelectedMembershipId] = useState<number | undefined>(undefined); // Assuming a user has a membership ID

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter(record =>
      record.userId.toString().includes(searchTerm.toLowerCase()) ||
      new Date(record.checkInTime).toLocaleString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.checkOutTime && new Date(record.checkOutTime).toLocaleString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.checkOutTime ? 'completed' : 'active').includes(searchTerm.toLowerCase())
    );
  }, [attendanceRecords, searchTerm]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRecords, currentPage, itemsPerPage]);

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
      // NOTE: The current checkOut signature in useAttendance.ts takes an attendanceId.
      // We need to modify useAttendance.ts or assume how to get this.
      // For demonstration, let's assume a dummy attendanceId or modify checkOut.
      // Given the current checkOut signature, a direct call here for a userId is not possible.
      showToast("Manual check-out not fully implemented due to API limitations.", "error");
      // await checkOut.mutateAsync(DUMMY_ATTENDANCE_ID_FOR_SELECTED_USER); // Placeholder
    } catch (err: any) {
      showToast(`Error during manual check-out: ${err.message}`, "error");
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        icon={CalendarCheck}
        title="Attendance"
        subtitle="Monitor and manage member attendance."
      />
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">All Attendance Records</h2>
        {isLoading ? (
          <div className="text-center text-gray-500">Loading all attendance records...</div>
        ) : isError ? (
          <div className="text-center text-red-500">Error: {error?.message || "Failed to fetch attendance records"}</div>
        ) : attendanceRecords.length > 0 ? (
          <>
            <Table
              headers={["User ID", "Check-in Time", "Check-out Time", "Status"]}
                          columnClasses={['w-1/6', 'w-2/6', 'w-2/6', 'w-1/6 text-center']}
                          data={paginatedRecords}
                          renderCells={(record: Attendance) => [
                            record.userId,
                            new Date(record.checkInTime).toLocaleString(),
                            record.checkOutTime ? new Date(record.checkOutTime).toLocaleString() : 'N/A',
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.checkOutTime ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {record.checkOutTime ? 'Completed' : 'Active'}
                            </span>,
                          ]}
                          keyExtractor={(record: Attendance) => record.id}              searchPlaceholder="Search records..."
              searchTerm={searchTerm}
              onSearchChange={(value: string) => {
                setSearchTerm(value);
                setCurrentPage(1); // Reset to first page on search
              }}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className="p-6">
            <EmptyState
              icon={CalendarOff}
              title="No attendance records yet"
              description="It looks like no members have checked in or out. Use the manual entry section below to get started."
              buttonText="Scroll to Manual Entry"
              onButtonClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            />
          </div>
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