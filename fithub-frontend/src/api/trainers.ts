import type { Trainer } from "../types/Trainer";

/* ------------------ GET TRAINERS ------------------ */
export async function fetchTrainers(): Promise<Trainer[]> {
  const token = localStorage.getItem("authToken");

  const res = await fetch("http://localhost:8001/auth/admin/trainers", {
    headers: {
      Authorization: `Basic ${token}`,
    },
  });

  if (!res.ok) return [];
  return res.json();
}

/* ------------------ CREATE TRAINER ------------------ */
export async function createTrainer(data: any) {
  const token = localStorage.getItem("authToken");

  const res = await fetch("http://localhost:8001/auth/trainer/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${token}`,
    },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
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

  const res = await fetch(`http://localhost:8001/auth/admin/user/${id}`, {
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

  const res = await fetch(`http://localhost:8001/auth/user/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${token}`,
    },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
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
