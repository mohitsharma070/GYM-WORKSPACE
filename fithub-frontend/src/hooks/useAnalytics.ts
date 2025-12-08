// src/hooks/useAnalytics.ts

import { useQuery } from "@tanstack/react-query";
import { fetchAnalytics, fetchTrend } from "../api/analytics";

export function useAnalytics(month: number, year: number) {
  return useQuery({
    queryKey: ["analytics", month, year],
    queryFn: () => fetchAnalytics(month, year),
    retry: 1,
  });
}

export function useAnalyticsTrend(month: number, year: number) {
  return useQuery({
    queryKey: ["analyticsTrend", month, year],
    queryFn: () => fetchTrend(month, year),
    retry: 1,
  });
}
