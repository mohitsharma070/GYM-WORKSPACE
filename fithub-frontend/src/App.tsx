import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardRoutes from "./components/DashboardRoutes"; // New component
import Login from "./pages/Login";
import { ToastProvider } from "./components/ToastProvider";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [role, setRole] = useState<"admin" | "trainer" | "member" | null>(
    localStorage.getItem("userRole") as "admin" | "trainer" | "member"
  );

  // 🔥 Detect logout (localStorage cleared)
  useEffect(() => {
    const handleStorage = () => {
      setToken(localStorage.getItem("authToken"));
      setRole(localStorage.getItem("userRole") as "admin" | "trainer" | "member");
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLogin = (authToken: string, userRole: string) => {
    localStorage.setItem("authToken", authToken);
    localStorage.setItem("userRole", userRole);
    setToken(authToken);
    setRole(userRole as "admin" | "trainer" | "member");
  };

  const isAuthenticated = !!token;

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/*"
            element={
              isAuthenticated ? (
                <DashboardRoutes
                  userRole={role}
                  isAuthenticated={isAuthenticated}
                  onLoginSuccess={handleLogin}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
