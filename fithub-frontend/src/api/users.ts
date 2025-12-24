import type { PageRequest, PageResponse } from "../types/Page";
import type { User } from "../types/User";
import { API_BASE_USER } from "../utils/config";

type PagedUsers = PageResponse<User>;

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 10;

function buildUserQuery(params: PageRequest = {}): string {
  const query = new URLSearchParams({
    page: String(params.page ?? DEFAULT_PAGE),
    size: String(params.size ?? DEFAULT_SIZE),
    sortBy: params.sortBy ?? "id",
    sortDir: params.sortDir ?? "asc",
  });

  if (params.search) {
    query.append("search", params.search.trim());
  }

  return query.toString();
}

async function fetchUserPage(path: string, params: PageRequest = {}): Promise<PagedUsers> {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`${API_BASE_USER}${path}?${buildUserQuery(params)}`, {
    headers: token ? { Authorization: `Basic ${token}` } : undefined,
  });

  if (!res.ok) throw new Error("Failed to load users");

  return (await res.json()) as PagedUsers;
}

/* ------------------ LOAD USERS (admin views) ------------------ */
export function fetchAllUsersPage(params: PageRequest = {}): Promise<PagedUsers> {
  return fetchUserPage("/auth/admin/all", params);
}

export function fetchMembersPage(params: PageRequest = {}): Promise<PagedUsers> {
  return fetchUserPage("/auth/admin/members", params);
}

/* ------------------ LOAD USERS (trainer view) ------------------ */
export function fetchTrainerMembersPage(params: PageRequest = {}): Promise<PagedUsers> {
  return fetchUserPage("/auth/trainer/members", params);
}

/* ------------------ UNIVERSAL DELETE USER ------------------ */
export async function deleteUser(id: number): Promise<boolean> {
  const token = localStorage.getItem("authToken");

  const res = await fetch(`${API_BASE_USER}/auth/admin/user/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Basic ${token}` } : undefined,
  });

  return res.ok;
}

/* ------------------ CREATE MEMBER (same as before) ------------------ */
export async function createUser(data: any): Promise<User> {
  const token = localStorage.getItem("authToken");

  const res = await fetch(`${API_BASE_USER}/auth/member/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Basic ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error: any = new Error("Failed to create user");
    error.status = res.status;
    throw error;
  }

  return (await res.json()) as User;
}

/* ------------------ REACTIVATE MEMBER ------------------ */
export async function reactivateUser(email: string): Promise<User> {
  const token = localStorage.getItem("authToken");

  const res = await fetch(`${API_BASE_USER}/auth/member/reactivate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Basic ${token}` } : {}),
    },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error("Failed to reactivate user");
  }

  return (await res.json()) as User;
}

/* ------------------ UNIVERSAL UPDATE USER ------------------ */
export async function updateUser(id: number, updates: any): Promise<any> {
  const token = localStorage.getItem("authToken");

  const res = await fetch(`${API_BASE_USER}/auth/user/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Basic ${token}` } : {}),
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) throw new Error("Failed to update user");

  return res.json();
}
