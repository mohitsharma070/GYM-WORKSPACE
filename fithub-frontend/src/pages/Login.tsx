import { useState } from "react";
import { Dumbbell } from "lucide-react";

interface LoginProps {
  onLogin: (token: string, role: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const basicToken = btoa(`${email}:${password}`);

    try {
      const res = await fetch("http://localhost:8001/auth/me", {
        method: "GET",
        headers: { Authorization: `Basic ${basicToken}` },
      });

      if (!res.ok) {
        setLoading(false);
        setError("Invalid email or password");
        return;
      }

      const user = await res.json();

      const mappedRole =
        user.role === "ROLE_ADMIN"
          ? "admin"
          : user.role === "ROLE_TRAINER"
          ? "trainer"
          : "member";

      localStorage.setItem("authToken", basicToken);
      localStorage.setItem("userRole", mappedRole);

      setLoading(false);
      onLogin(basicToken, mappedRole);
    } catch (err) {
      setLoading(false);
      setError("Server unreachable. Try again later.");
    }
  }

  return (
    <div className="login-bg">
      <div className="login-overlay"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white bg-opacity-90 backdrop-blur-md rounded-2xl shadow-xl p-8">

          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg">
              <Dumbbell size={32} className="text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">
            Login to FitHub
          </h2>

          <p className="text-center text-gray-500 mb-6">
            Welcome back! Please enter your credentials.
          </p>

          {error && (
            <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-center border border-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                autoFocus
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-gray-700"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-gray-700"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white font-semibold rounded-lg transition-all shadow-lg 
               bg-gradient-to-r from-violet-500 to-fuchsia-500 
               hover:opacity-90 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6 text-sm">
            © {new Date().getFullYear()} FitHub Fitness Platform
          </p>
        </div>
      </div>
    </div>
  );
}
