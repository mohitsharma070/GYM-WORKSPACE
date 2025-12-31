import type { Plan } from "../types/Plan";
import { API_BASE_MEMBERSHIP } from "../utils/config";

export async function loadPlan(memberId: number): Promise<Plan | null> {
  const res = await fetch(`${API_BASE_MEMBERSHIP}/member/${memberId}/plan`);
  if (!res.ok) return null;
  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text);
}

export async function assignPlanToMember(
  memberId: number,
  planId: number,
  startDate: string
) {
  const token = localStorage.getItem("authToken");
  const res = await fetch(
    `${API_BASE_MEMBERSHIP}/member/${memberId}/plan/${planId}?startDate=${startDate}`,
    {
      method: "POST",
      headers: token ? { Authorization: `Basic ${token}` } : undefined,
    }
  );
  return res.ok;
}

export async function deleteMemberPlan(id: number) {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`${API_BASE_MEMBERSHIP}/member/${id}/plan`, {
    method: "DELETE",
    headers: token ? { Authorization: `Basic ${token}` } : undefined,
  });
  return res.ok;
}

export async function subscribeToPlan(userId: number, planId: number) {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`${API_BASE_MEMBERSHIP}/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Basic ${token}` } : {}),
    },
    body: JSON.stringify({ userId, planId }),
  });
  return res.ok;
}
