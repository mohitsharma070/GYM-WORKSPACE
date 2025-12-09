import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  assignWorkoutPlan,
  updateAssignedWorkoutPlan,
  cancelAssignedWorkoutPlan,
  fetchAssignedWorkoutPlanById,
  fetchAssignedWorkoutPlansByMemberId,
  fetchCurrentAssignedWorkoutPlanForMember,
  fetchAssignedWorkoutPlansByTrainerId,
  deleteAssignedWorkoutPlan,
} from "../api/assignedWorkoutPlans";
import { type AssignedWorkoutPlan, type AssignedWorkoutPlanRequest } from "../types/AssignedWorkoutPlan";

export function useAssignedWorkoutPlan(id: number) {
  return useQuery<AssignedWorkoutPlan, Error>({
    queryKey: ["assignedWorkoutPlan", id],
    queryFn: () => fetchAssignedWorkoutPlanById(id),
    enabled: !!id,
  });
}

export function useAssignedWorkoutPlansByMemberId(memberId: number) {
  return useQuery<AssignedWorkoutPlan[], Error>({
    queryKey: ["assignedWorkoutPlans", "member", memberId],
    queryFn: () => fetchAssignedWorkoutPlansByMemberId(memberId),
    enabled: !!memberId,
  });
}

export function useCurrentAssignedWorkoutPlanForMember(memberId: number) {
  return useQuery<AssignedWorkoutPlan, Error>({
    queryKey: ["currentAssignedWorkoutPlan", "member", memberId],
    queryFn: () => fetchCurrentAssignedWorkoutPlanForMember(memberId),
    enabled: !!memberId,
  });
}

export function useAssignedWorkoutPlansByTrainerId(trainerId: number) {
  return useQuery<AssignedWorkoutPlan[], Error>({
    queryKey: ["assignedWorkoutPlans", "trainer", trainerId],
    queryFn: () => fetchAssignedWorkoutPlansByTrainerId(trainerId),
    enabled: !!trainerId,
  });
}

export function useAssignWorkoutPlan() {
  const queryClient = useQueryClient();
  return useMutation<AssignedWorkoutPlan, Error, AssignedWorkoutPlanRequest>({
    mutationFn: assignWorkoutPlan,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["assignedWorkoutPlans", "member", data.memberId] });
      queryClient.invalidateQueries({ queryKey: ["currentAssignedWorkoutPlan", "member", data.memberId] });
      queryClient.invalidateQueries({ queryKey: ["assignedWorkoutPlans", "trainer", data.assignedByTrainerId] });
    },
  });
}

export function useUpdateAssignedWorkoutPlan() {
  const queryClient = useQueryClient();
  return useMutation<AssignedWorkoutPlan, Error, { id: number; payload: AssignedWorkoutPlanRequest }>({
    mutationFn: ({ id, payload }) => updateAssignedWorkoutPlan(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assignedWorkoutPlans", "member", data.memberId] });
      queryClient.invalidateQueries({ queryKey: ["currentAssignedWorkoutPlan", "member", data.memberId] });
      queryClient.invalidateQueries({ queryKey: ["assignedWorkoutPlans", "trainer", data.assignedByTrainerId] });
      queryClient.invalidateQueries({ queryKey: ["assignedWorkoutPlan", variables.id] });
    },
  });
}

export function useCancelAssignedWorkoutPlan() {
  const queryClient = useQueryClient();
  return useMutation<AssignedWorkoutPlan, Error, number>({
    mutationFn: cancelAssignedWorkoutPlan,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assignedWorkoutPlans", "member", data.memberId] });
      queryClient.invalidateQueries({ queryKey: ["currentAssignedWorkoutPlan", "member", data.memberId] });
      queryClient.invalidateQueries({ queryKey: ["assignedWorkoutPlans", "trainer", data.assignedByTrainerId] });
      queryClient.invalidateQueries({ queryKey: ["assignedWorkoutPlan", variables] });
    },
  });
}

export function useDeleteAssignedWorkoutPlan() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteAssignedWorkoutPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignedWorkoutPlans"] }); // Invalidate all assigned plans, or be more specific if memberId is available
    },
  });
}
