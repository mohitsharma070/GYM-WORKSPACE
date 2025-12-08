export async function api(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("authToken");

  options.headers = {
    "Content-Type": "application/json",
    Authorization: `Basic ${token}`,
    ...(options.headers || {}),
  };

  const res = await fetch(path, options);

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}
