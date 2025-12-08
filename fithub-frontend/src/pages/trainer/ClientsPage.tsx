import { useEffect, useState } from "react";

interface Client {
  id: number;
  name: string;
  email: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadClients() {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch("http://localhost:8001/auth/trainer/members", {
        headers: {
          Authorization: `Basic ${token}`,
        },
      });

      if (!res.ok) {
        setError("Failed to load clients.");
        return;
      }

      const data = await res.json();
      setClients(data || []);
    } catch {
      setError("Server unreachable.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  // LOADING
  if (loading) {
    return <p className="text-gray-600 mt-6">Loading clients...</p>;
  }

  // ERROR
  if (error) {
    return (
      <div className="mt-10 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadClients}
          className="px-5 py-2 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Title */}
      <h1 className="text-3xl font-bold mb-6">My Clients</h1>

      {/* Table */}
      <div className="bg-white shadow rounded-lg p-6 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-gray-100 text-left">
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
            </tr>
          </thead>

          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-gray-500">
                  No clients found.
                </td>
              </tr>
            ) : (
              clients.map((client, index) => (
                <tr
                  key={client.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{client.name}</td>
                  <td className="p-3">{client.email}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
