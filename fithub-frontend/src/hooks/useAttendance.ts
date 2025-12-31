import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import type { Attendance } from "../types/Attendance";

import { API_BASE_ATTENDANCE } from "../utils/config";
const ATTENDANCE_SERVICE_BASE_URL = `${API_BASE_ATTENDANCE}/api/attendances`;

interface CheckInPayload {
  userId: number;
  membershipId: number;
  fingerprintVerified?: boolean;
}

export function useAttendances() {
  const queryClient = useQueryClient();

  // Fetch paginated attendances
  const fetchAllAttendances = async (page = 0, size = 10, sort = "checkInTime,desc", userId?: number) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort,
    });
    if (userId !== undefined) params.append("userId", userId.toString());
    return api(`${ATTENDANCE_SERVICE_BASE_URL}/paged?${params.toString()}`);
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

  const getAttendancesByUserId = (userId: number, page = 0, size = 10, sort = "checkInTime,desc") => {
    return useQuery({
      queryKey: ["attendances", userId, page, size, sort],
      queryFn: async () => api(`${ATTENDANCE_SERVICE_BASE_URL}/user/${userId}/paged?page=${page}&size=${size}&sort=${sort}`),
      enabled: !!userId,
    });
  };

  // Main paginated attendances query
  const allAttendancesQuery = (page = 0, size = 10, sort = "checkInTime,desc", userId?: number) =>
    useQuery({
      queryKey: ["attendances", page, size, sort, userId],
      queryFn: async () => fetchAllAttendances(page, size, sort, userId),
    });

  return {
    allAttendancesQuery,
    checkIn,
    checkOut,
    getAttendancesByUserId,
  };
}
