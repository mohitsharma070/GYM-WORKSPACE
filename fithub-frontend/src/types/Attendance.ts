

export type AttendanceStatus = "PRESENT" | "ABSENT" | "PENDING";

export type Attendance = {
  id: number;
  userId: number;
  membershipId: number;
  checkInTime: string; // ISO date string
  checkOutTime?: string; // ISO date string, optional
  status: AttendanceStatus;
  fingerprintVerified?: boolean;
}
