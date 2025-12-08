import { useEffect, useState } from "react";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [role, setRole] = useState(localStorage.getItem("userRole"));

  // 🔥 Detect logout (localStorage cleared)
  useEffect(() => {
    const handleStorage = () => {
      setToken(localStorage.getItem("authToken"));
      setRole(localStorage.getItem("userRole"));
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (!token) {
    return (
      <Login
        onLogin={(t, r) => {
          setToken(t);
          setRole(r);
        }}
      />
    );
  }

  return <DashboardLayout userRole={role as "admin" | "trainer" | "member"} />;
}
