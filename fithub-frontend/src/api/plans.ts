import type { Plan } from "../types/Plan";
import { API_BASE_MEMBERSHIP } from "../utils/config";

export async function fetchAllPlans(): Promise<Plan[]> {
  const res = await fetch(`${API_BASE_MEMBERSHIP}/plans`);
  return res.ok ? await res.json() : [];
}
