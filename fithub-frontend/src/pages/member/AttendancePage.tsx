import { useState } from "react";
import { initiateFingerprintScan } from "../../utils/fingerprintScanner";
import { markAttendance } from "../../api/attendance";
import { useToast } from "../../components/ToastProvider";
import { useAuth } from "../../hooks/useAuth";
import { useAttendances } from "../../hooks/useAttendance";
import type { Attendance } from '../../types/Attendance'; // Import Attendance type as a type-only import

export default function AttendancePage() {
  const [status, setStatus] = useState("Ready");
  const [isScanning, setIsScanning] = useState(false);
  const { showToast } = useToast();
  const { memberId } = useAuth();
  const { getAttendancesByUserId } = useAttendances();
  const { data: attendanceRecords = [], isLoading, isError, error } = getAttendancesByUserId(memberId || 0);

  // Explicitly type attendanceRecords after fetching
  const typedAttendanceRecords: Attendance[] = attendanceRecords || [];

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
      <div className="bg-white shadow rounded-lg p-6">
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
          <ul className="space-y-3">
            {typedAttendanceRecords.map((record) => (
              <li key={record.id} className="bg-gray-50 p-4 rounded-lg shadow-sm flex justify-between items-center">
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
        ) : (
          <div className="text-center text-gray-500">No attendance records found.</div>
        )}
      </div>
    </div>
  );
}
