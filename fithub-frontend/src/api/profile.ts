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
