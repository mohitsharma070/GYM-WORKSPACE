import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  submitWorkoutLog,
  updateWorkoutLog,
  fetchWorkoutLogById,
  fetchWorkoutLogsByMemberId,
  deleteWorkoutLog,
} from "../api/workoutLogs";
import { type WorkoutLog, type WorkoutLogRequest } from "../types/WorkoutLog";

export function useWorkoutLog(id: number) {
  return useQuery<WorkoutLog, Error>({
    queryKey: ["workoutLog", id],
    queryFn: () => fetchWorkoutLogById(id),
    enabled: !!id,
  });
}

export function useWorkoutLogsByMemberId(memberId: number) {
  return useQuery<WorkoutLog[], Error>({
    queryKey: ["workoutLogs", "member", memberId],
    queryFn: () => fetchWorkoutLogsByMemberId(memberId),
    enabled: !!memberId,
  });
}

export function useSubmitWorkoutLog() {
  const queryClient = useQueryClient();
  return useMutation<WorkoutLog, Error, WorkoutLogRequest>({
    mutationFn: submitWorkoutLog,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["workoutLogs", "member", data.memberId] });
    },
  });
}

export function useUpdateWorkoutLog() {
  const queryClient = useQueryClient();
  return useMutation<WorkoutLog, Error, { id: number; payload: WorkoutLogRequest }>({
    mutationFn: ({ id, payload }) => updateWorkoutLog(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workoutLogs", "member", data.memberId] });
      queryClient.invalidateQueries({ queryKey: ["workoutLog", variables.id] });
    },
  });
}

export function useDeleteWorkoutLog() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteWorkoutLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workoutLogs"] }); // Could be more specific if memberId is passed
    },
  });
}
