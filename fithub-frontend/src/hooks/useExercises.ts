import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllExercises,
  fetchExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
  type CreateExercisePayload,
  type UpdateExercisePayload,
} from "../api/exercises";
import { type Exercise } from "../types/Exercise";

export function useAllExercises() {
  return useQuery<Exercise[], Error>({
    queryKey: ["exercises"],
    queryFn: fetchAllExercises,
  });
}

export function useExercise(id: number) {
  return useQuery<Exercise, Error>({
    queryKey: ["exercise", id],
    queryFn: () => fetchExerciseById(id),
    enabled: !!id,
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();
  return useMutation<Exercise, Error, CreateExercisePayload>({
    mutationFn: createExercise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();
  return useMutation<Exercise, Error, { id: number; payload: UpdateExercisePayload }>({
    mutationFn: ({ id, payload }) => updateExercise(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      queryClient.invalidateQueries({ queryKey: ["exercise", variables.id] });
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteExercise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}
