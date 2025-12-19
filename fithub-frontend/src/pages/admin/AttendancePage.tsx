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
import { Button } from "../../components/Button";

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
    <div className="space-y-8">
      <PageHeader
        icon={CalendarCheck}
        title="Attendance"
        subtitle="Monitor and manage member attendance."
      />
      <div className="bg-white shadow-sm rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Attendance Records</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading attendance records...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg font-medium mb-4">Failed to load attendance records</p>
            <p className="text-gray-500 mb-6">{error?.message}</p>
            <Button
              onClick={() => allAttendancesQuery.refetch()}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        ) : attendanceRecords.length > 0 ? (
          <>
            <Table
              headers={["User ID", "Check-in Time", "Check-out Time", "Status"]}
              columnClasses={['w-1/6 text-center', 'w-2/6', 'w-2/6', 'w-1/6 text-center']}
              data={paginatedRecords}
              renderCells={(record: Attendance) => [
                <span className="font-semibold text-gray-900">{record.userId}</span>,
                <span className="text-gray-600">{new Date(record.checkInTime).toLocaleString()}</span>,
                <span className="text-gray-600">{record.checkOutTime ? new Date(record.checkOutTime).toLocaleString() : 'N/A'}</span>,
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  record.checkOutTime ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {record.checkOutTime ? 'Completed' : 'Active'}
                </span>,
              ]}
              keyExtractor={(record: Attendance) => record.id}
              searchPlaceholder="Search attendance records..."
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
          <EmptyState
            icon={CalendarOff}
            title="No attendance records yet"
            description="It looks like no members have checked in or out. Use the manual entry section below to get started."
            buttonText="Scroll to Manual Entry"
            onButtonClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          />
        )}
      </div>

      <div className="bg-white shadow-sm rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Manual Attendance Entry</h2>
        {usersLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          </div>
        ) : usersError ? (
          <div className="text-center py-8">
            <p className="text-red-600 text-lg font-medium mb-4">Error loading users</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Select User
                </label>
                <select
                  id="user-select"
                  name="user-select"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label htmlFor="membership-id" className="block text-sm font-medium text-gray-700 mb-2">
                  Membership ID (for Check-in)
                </label>
                <input
                  type="number"
                  id="membership-id"
                  name="membership-id"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedMembershipId || ''}
                  onChange={(e) => setSelectedMembershipId(Number(e.target.value))}
                  placeholder="Enter Membership ID"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                onClick={handleManualCheckIn}
                disabled={!selectedUserId || checkIn.status === 'pending'}
                className="bg-green-600 hover:bg-green-700"
              >
                {checkIn.status === 'pending' ? "Checking In..." : "Manual Check-in"}
              </Button>
              <Button
                onClick={handleManualCheckOut}
                disabled={!selectedUserId || checkOut.status === 'pending'}
                variant="destructive"
              >
                {checkOut.status === 'pending' ? "Checking Out..." : "Manual Check-out"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}