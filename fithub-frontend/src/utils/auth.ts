export function setAuthToken(email: string, password: string) {
  const token = btoa(`${email}:${password}`);
  localStorage.setItem("authToken", token);
}

export function getAuthHeader() {
  const token = localStorage.getItem("authToken");
  return token ? `Basic ${token}` : "";
}
