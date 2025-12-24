// Update admin profile
export async function updateAdminProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("Missing auth token");

  const res = await fetch("http://localhost:8001/auth/admin/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${token}`,
    },
    body: JSON.stringify(profile),
  });

  if (!res.ok) {
    throw new Error("Failed to update profile");
  }

  return res.json();
}
// src/api/profile.ts

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
}

export async function fetchProfile(): Promise<UserProfile> {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("Missing auth token");

  const res = await fetch("http://localhost:8001/auth/me", {
    headers: { Authorization: `Basic ${token}` },
  });

  if (!res.ok) {
    throw new Error("Failed to load profile");
  }

  return res.json();
}
