import { useState } from "react";
import { initiateFingerprintScan } from "../../utils/fingerprintScanner";
import { markAttendance } from "../../api/attendance";

export default function AttendancePage() {
  const [status, setStatus] = useState("Ready");
  const [isScanning, setIsScanning] = useState(false);

  const handleAttendanceScan = async () => {
    setIsScanning(true);
    setStatus("Scanning... Please place your finger on the scanner.");
    try {
      const fingerprintData = await initiateFingerprintScan();
      const response = await markAttendance(fingerprintData);
      setStatus(response);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
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
        <div className="text-lg text-center mt-4">
          Status: <span className="font-semibold">{status}</span>
        </div>
      </div>
    </div>
  );
}
