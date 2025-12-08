import { useEffect, useState } from "react";
import { useSubscriptions } from "../../hooks/useSubscriptions";

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  durationDays: number;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openRow, setOpenRow] = useState<number | null>(null);
  const { subscribe, loading:subscribing, error: subscribeError } = useSubscriptions();

  async function loadPlans() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8002/plans"); // your membership service URL
      if (!res.ok) {
        setError("Failed to load plans.");
        return;
      }

      const data = await res.json();
      setPlans(data || []);
    } catch {
      setError("Server unreachable.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe(planId: number) {
    // In a real app, you would get the user ID from your auth context
    const userId = 1; 
    const success = await subscribe(userId, planId);
    if (success) {
      alert("Successfully subscribed!");
    }
  }

  useEffect(() => {
    loadPlans();
  }, []);

  // Convert days into months + days
  function formatDuration(days: number) {
    const months = Math.floor(days / 30);
    const remDays = days % 30;

    if (months > 0 && remDays > 0) return `${months} months ${remDays} days`;
    if (months > 0) return `${months} months`;
    return `${remDays} days`;
  }

  if (loading) {
    return (
      <div className="mt-10">
        <h1 className="text-3xl font-bold">Plans</h1>
        <div className="space-y-3 animate-pulse mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10">
        <p className="text-red-600 text-lg">{error}</p>
        <button
          onClick={loadPlans}
          className="px-4 py-2 mt-4 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Membership Plans</h1>

      <div className="bg-white shadow rounded-lg p-6 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b bg-gray-100">
              <th className="p-3">#</th>
              <th className="p-3">Plan Name</th>
              <th className="p-3">Price (₹)</th>
              <th className="p-3">Duration</th>
            </tr>
          </thead>

          <tbody>
            {plans.length === 0 && (
              <tr>
                <td colSpan={4} className="p-5 text-center text-gray-500">
                  No plans available.
                </td>
              </tr>
            )}

            {plans.map((p, index) => (
              <>
                {/* MAIN ROW */}
                <tr
                  key={p.id}
                  onClick={() => setOpenRow(openRow === index ? null : index)}
                  className="border-b hover:bg-gray-50 cursor-pointer transition"
                >
                  <td className="p-3">{index + 1}</td>

                  <td className="p-3 font-medium">{p.name}</td>

                  <td className="p-3 font-semibold text-green-700">
                    ₹{p.price}
                  </td>

                  <td className="p-3 flex items-center gap-2">
                    {formatDuration(p.durationDays)}

                    <span
                      className={`transform transition-transform ml-2 ${
                        openRow === index ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </td>
                </tr>

                {/* DROPDOWN ROW */}
                {openRow === index && (
                  <tr className="bg-gray-50 border-b">
                    <td colSpan={4} className="p-5">

                      <div className="p-4 border rounded bg-white shadow-sm">
                        <h2 className="text-lg font-semibold mb-2">
                          Description
                        </h2>
                        <p className="text-gray-700">
                          {p.description || "No description available."}
                        </p>
                        <div className="mt-4">
                          <button
                            onClick={() => handleSubscribe(p.id)}
                            disabled={subscribing}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                          >
                            {subscribing ? "Subscribing..." : "Subscribe"}
                          </button>
                          {subscribeError && (
                            <p className="text-red-600 mt-2">{subscribeError}</p>
                          )}
                        </div>
                      </div>

                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
