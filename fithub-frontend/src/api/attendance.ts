import { API_BASE_ATTENDANCE } from "../utils/config";

export async function markAttendance(fingerprint: string): Promise<string> {
  const token = localStorage.getItem("authToken");

  const res = await fetch(`${API_BASE_ATTENDANCE}/api/fingerprints/checkin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Basic ${token}` } : {}),
    },
    body: JSON.stringify({ fingerprint }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to mark attendance");
  }

  return await res.text();
}
