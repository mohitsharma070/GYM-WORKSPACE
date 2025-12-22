import { useState } from "react";
import { Dumbbell, Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";

interface LoginProps {
  onLogin: (token: string, role: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        <div className="w-full max-w-md bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">

          {/* Enhanced Logo Section */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-xl">
                <Dumbbell size={36} className="text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">
            Welcome to FitHub
          </h2>

          <p className="text-center text-gray-600 mb-4">
            Please enter your credentials to continue.
          </p>

          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Secure Login</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 px-4 py-3 rounded-xl text-center border border-red-200 shadow-sm">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                Email Address
              </label>
              <input
                type="email"
                autoFocus
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-700 bg-gray-50 focus:bg-white transition-all"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-500" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-700 bg-gray-50 focus:bg-white transition-all"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-white font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] 
               bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 
               hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600
               ${loading ? "opacity-50 cursor-not-allowed transform-none" : ""}`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing you in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span>Sign In Securely</span>
                </div>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} FitHub Fitness Platform
            </p>
            <div className="flex justify-center mt-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
