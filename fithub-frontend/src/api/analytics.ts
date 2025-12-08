// src/api/analytics.ts

import type { Stats } from "../types/Stats"; // If Stats is not in a file, remove this.

export async function fetchAnalytics(month: number, year: number): Promise<Stats> {
  const token = localStorage.getItem("authToken");
  const headers = { Authorization: `Basic ${token}` };

  const res = await fetch(
    `http://localhost:8002/auth/analytics?month=${month}&year=${year}`,
    { headers }
  );

  if (!res.ok) throw new Error("Failed to fetch analytics");

  return res.json();
}

export async function fetchTrend(month: number, year: number): Promise<any[]> {
  const token = localStorage.getItem("authToken");
  const headers = { Authorization: `Basic ${token}` };

  const res = await fetch(
    `http://localhost:8002/auth/analytics/trend?month=${month}&year=${year}`,
    { headers }
  );

  if (!res.ok) throw new Error("Failed to fetch trend");

  const json = await res.json();

  return json.map((j: any) => ({
    name: `${j.month}/${j.year}`,
    planRevenue: j.planRevenue,
    productRevenue: j.productRevenue,
    members: j.membersThisMonth,
  }));
}
