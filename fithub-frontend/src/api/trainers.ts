import type { PageRequest, PageResponse } from "../types/Page";
import type { Trainer } from "../types/Trainer";
import { API_BASE_USER } from "../utils/config";

type PagedTrainers = PageResponse<Trainer>;

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 10;

function buildTrainerQuery(params: PageRequest = {}): string {
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

/* ------------------ GET TRAINERS ------------------ */
export async function fetchTrainers(params: PageRequest = {}): Promise<PagedTrainers> {
  const token = localStorage.getItem("authToken");

  const res = await fetch(
    `${API_BASE_USER}/auth/admin/trainers?${buildTrainerQuery(params)}`,
    {
      headers: token ? { Authorization: `Basic ${token}` } : undefined,
    },
  );

  if (!res.ok) throw new Error("Failed to load trainers");
  return res.json();
}

/* ------------------ CREATE TRAINER ------------------ */
export async function createTrainer(data: any) {
  const token = localStorage.getItem("authToken");

  const res = await fetch(`${API_BASE_USER}/auth/trainer/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${token}`,
    },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
      dateOfBirth: data.dateOfBirth, // Ensure DOB is sent
      specialization: data.specialization,
      experienceYears: Number(data.experienceYears),
      certification: data.certification,
      phone: data.phone,
    }),
  });

  if (!res.ok) {
    console.error("Create trainer failed");
    throw new Error("Failed to create trainer");
  }

  return res.json();
}

/* ------------------ DELETE TRAINER (FINAL WORKING VERSION) ------------------ */
export async function deleteTrainer(id: number) {
  const token = localStorage.getItem("authToken");

  const res = await fetch(`${API_BASE_USER}/auth/admin/user/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Basic ${token}`,
    },
  });

  if (!res.ok) {
    console.error("Delete failed");
    throw new Error("Failed to delete trainer");
  }

  return true;
}

/* ------------------ UPDATE TRAINER ------------------ */
export async function updateTrainer(id: number, data: any) {
  const token = localStorage.getItem("authToken");

  const res = await fetch(`${API_BASE_USER}/auth/user/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${token}`,
    },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      dateOfBirth: data.dateOfBirth, // Ensure DOB is sent
      specialization: data.specialization,
      experienceYears: Number(data.experienceYears),
      certification: data.certification,
      phone: data.phone,
    }),
  });

  if (!res.ok) {
    console.error("Update trainer failed");
    throw new Error("Failed to update trainer");
  }

  return res.json();
}
