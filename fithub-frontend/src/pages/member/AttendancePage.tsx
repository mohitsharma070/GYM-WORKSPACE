import { useState, useMemo } from "react";
import { AttendanceStatCards } from "../../components/AttendanceStatCards";
import { initiateFingerprintScan } from "../../utils/fingerprintScanner";
import { markAttendance } from "../../api/attendance";
import { useToast } from "../../components/ToastProvider";
import { useAuth } from "../../hooks/useAuth";
import { useAttendances } from "../../hooks/useAttendance";
import type { Attendance } from '../../types/Attendance'; // Import Attendance type as a type-only import
import EmptyState from "../../components/EmptyState"; // Import EmptyState
import { CalendarOff } from "lucide-react"; // Import CalendarOff icon

export default function AttendancePage() {
  const [status, setStatus] = useState("Ready");
  const [isScanning, setIsScanning] = useState(false);
  const { showToast } = useToast();
  const { memberId } = useAuth();
  const { getAttendancesByUserId } = useAttendances();
  const { data: attendanceRecords = [], isLoading, isError, error } = getAttendancesByUserId(memberId || 0);

  // Explicitly type attendanceRecords after fetching
  const typedAttendanceRecords: Attendance[] = attendanceRecords || [];

  // Compute stats for stat cards
  const attendanceStats = useMemo(() => {
    let totalCheckIns = 0;
    let totalCheckOuts = 0;
    let totalDaysPresent = 0;
    let currentStreak = 0;
    let lastDate: string | null = null;
    let streak = 0;
    // Sort by checkInTime ascending
    const sorted = [...typedAttendanceRecords].sort((a, b) => new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime());
    sorted.forEach((rec) => {
      totalCheckIns++;
      if (rec.checkOutTime) totalCheckOuts++;
      // Count unique days present
      const day = rec.checkInTime.split('T')[0];
      if (lastDate !== day) {
        totalDaysPresent++;
        // Check streak
        if (lastDate) {
          const prev = new Date(lastDate);
          const curr = new Date(day);
          const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
          if (diff === 1) {
            streak++;
          } else {
            streak = 1;
          }
        } else {
          streak = 1;
        }
        lastDate = day;
      }
      if (streak > currentStreak) currentStreak = streak;
    });
    return {
      totalCheckIns,
      totalCheckOuts,
      currentStreak,
      totalDaysPresent,
    };
  }, [typedAttendanceRecords]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5; // Display fewer items for a list view

  const filteredRecords = useMemo(() => {
    return typedAttendanceRecords.filter(record =>
      new Date(record.checkInTime).toLocaleString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.checkOutTime && new Date(record.checkOutTime).toLocaleString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.checkOutTime ? 'completed' : 'active').includes(searchTerm.toLowerCase())
    );
  }, [typedAttendanceRecords, searchTerm]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRecords, currentPage, itemsPerPage]);

  const handleAttendanceScan = async () => {
    setIsScanning(true);
    setStatus("Scanning... Please place your finger on the scanner.");
    try {
      const fingerprintData = await initiateFingerprintScan();
      await markAttendance(fingerprintData);
      showToast("Action completed. Notification sent.", "success");
      setStatus("Attendance Marked Successfully!"); // Keep a local status for the page display
    } catch (error: any) {
      showToast(`Error: ${error.message}`, "error");
      setStatus(`Error: ${error.message}`); // Keep a local status for the page display
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Mark Attendance</h1>
      {/* Stat cards section */}
      <AttendanceStatCards stats={attendanceStats} />
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <button
          onClick={handleAttendanceScan}
          disabled={isScanning}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {isScanning ? "Scanning..." : "Scan Fingerprint to Mark Attendance"}
        </button>
        <div className="text-lg text-center mt-4 mb-6">
          Status: <span className="font-semibold">{status}</span>
        </div>

        <h2 className="text-2xl font-bold mb-4">Your Attendance Records</h2>
        {isLoading ? (
          <div className="text-center text-gray-500">Loading attendance records...</div>
        ) : isError ? (
          <div className="text-center text-red-500">Error: {error?.message || "Failed to fetch attendance records"}</div>
        ) : typedAttendanceRecords && typedAttendanceRecords.length > 0 ? (
          <>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search your records..."
                className="w-full p-2 border border-gray-300 rounded-md"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
            </div>
            {paginatedRecords.length > 0 ? (
              <>
                <ul className="space-y-3">
                  {paginatedRecords.map((record, index) => (
                    <li
                      key={record.id}
                      className={`p-4 rounded-lg shadow-sm flex justify-between items-center ${
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      } hover:bg-gray-100 transition duration-150 ease-in-out`}
                    >
                      <div>
                        <p className="text-gray-800 font-medium">Check-in: {new Date(record.checkInTime).toLocaleString()}</p>
                        {record.checkOutTime && (
                          <p className="text-gray-600 text-sm">Check-out: {new Date(record.checkOutTime).toLocaleString()}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${record.checkOutTime ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {record.checkOutTime ? 'Completed' : 'Active'}
                      </span>
                    </li>
                  ))}
                </ul>
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-indigo-500 text-white rounded-md disabled:bg-gray-300"
                    >
                      Previous
                    </button>
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-indigo-500 text-white rounded-md disabled:bg-gray-300"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={CalendarOff}
                title="No matching records found"
                description="Your search did not return any attendance records. Try adjusting your search term."
                buttonText="Clear Search"
                onButtonClick={() => setSearchTerm('')}
              />
            )}
          </>
        ) : (
          <EmptyState
            icon={CalendarOff}
            title="No attendance records yet"
            description="Your attendance records will appear here after you scan your fingerprint to check in or out."
            buttonText="Scan Fingerprint Now"
            onButtonClick={handleAttendanceScan}
          />
        )}
      </div>
    </div>
  );
}
