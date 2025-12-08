import { api } from "../utils/api";
import { API_BASE_MEMBERSHIP } from "../utils/config";

export function getPlans() {
  return api(`${API_BASE_MEMBERSHIP}/plans`);
}

export function createPlan(body: any) {
  return api(`${API_BASE_MEMBERSHIP}/plans`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
