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

  // Handle 204 No Content for DELETE requests which do not return a body
  if (res.status === 204) {
    return null;
  }

  // Only attempt to parse JSON if Content-Type header indicates JSON
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }

  // If not JSON, return the text or null if no content
  return res.text().then(text => text ? text : null);
}
