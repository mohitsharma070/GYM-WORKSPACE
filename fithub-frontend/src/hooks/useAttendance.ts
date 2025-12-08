import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import type { Attendance } from "../types/Attendance";

const ATTENDANCE_SERVICE_BASE_URL = "http://localhost:8003/api/fingerprints";

interface CheckInPayload {
  userId: number;
  membershipId: number;
  fingerprintVerified?: boolean;
}

export function useAttendances() {
  const queryClient = useQueryClient();

  const fetchAllAttendances = async (): Promise<Attendance[]> => {
    return api(ATTENDANCE_SERVICE_BASE_URL);
  };

  const checkIn = useMutation({
    mutationFn: async (payload: CheckInPayload): Promise<Attendance> => {
      const { userId, membershipId, fingerprintVerified } = payload;
      const queryParams = new URLSearchParams({
        userId: userId.toString(),
        membershipId: membershipId.toString(),
      });
      if (fingerprintVerified !== undefined) {
        queryParams.append("fingerprintVerified", fingerprintVerified.toString());
      }
      return api(`${ATTENDANCE_SERVICE_BASE_URL}/check-in?${queryParams.toString()}`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
    },
  });

  const checkOut = useMutation({
    mutationFn: async (attendanceId: number): Promise<Attendance> => {
      return api(`${ATTENDANCE_SERVICE_BASE_URL}/check-out/${attendanceId}`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
    },
  });

  const getAttendancesByUserId = (userId: number) => {
    return useQuery<Attendance[]>({
      queryKey: ["attendances", userId],
      queryFn: async () => api(`${ATTENDANCE_SERVICE_BASE_URL}/user/${userId}`),
      enabled: !!userId,
    });
  };

  const allAttendancesQuery = useQuery<Attendance[]>({
    queryKey: ["attendances"],
    queryFn: fetchAllAttendances,
  });

  return {
    allAttendancesQuery,
    checkIn,
    checkOut,
    getAttendancesByUserId,
  };
}
