import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, IndianRupee, Clock, ClipboardList } from "lucide-react";
import PageHeader from '../../components/PageHeader';

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  durationDays: number;
}

export default function PlansPageForAdmin() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    durationDays: "",
  });

  // Load Plans
  async function loadPlans() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8002/plans");

      if (!res.ok) {
        setError("Failed to fetch plans");
        return;
      }

      const data = await res.json();
      setPlans(data || []);
    } catch {
      setError("Server unreachable");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlans();
  }, []);

  function updateForm(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function openModal(plan?: Plan) {
    if (plan) {
      setEditPlan(plan);
      setForm({
        name: plan.name,
        description: plan.description,
        price: plan.price.toString(),
        durationDays: plan.durationDays.toString(),
      });
    } else {
      setEditPlan(null);
      setForm({
        name: "",
        description: "",
        price: "",
        durationDays: "",
      });
    }
    setShowModal(true);
  }

  async function savePlan() {
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      durationDays: Number(form.durationDays),
    };

    const url = editPlan
      ? `http://localhost:8002/plans/${editPlan.id}`
      : "http://localhost:8002/plans";

    const method = editPlan ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Failed to save plan");
      return;
    }

    setShowModal(false);
    loadPlans();
  }

  async function deletePlan(id: number) {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    const res = await fetch(`http://localhost:8002/plans/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Delete failed");
      return;
    }

    loadPlans();
  }

  // UI Rendering
  if (loading) return <p className="text-gray-600 text-lg">Loading plans...</p>;
  if (error) return <p className="text-red-600 text-lg">{error}</p>;

  return (
    <div>
      <PageHeader
        icon={ClipboardList}
        title="Membership Plans"
        subtitle="Manage your gym's membership plans."
        actions={
          <button
            onClick={() => openModal()}
            className="px-4 py-2 flex items-center gap-2 bg-gradient-to-r 
            from-[var(--color-primary)] to-[var(--color-accent)] 
            text-white rounded-lg shadow-md hover:opacity-90"
          >
            <Plus size={20} /> Add Plan
          </button>
        }
      />

      {/* PLANS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.id}
            className="bg-white shadow rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all relative"
          >
            <div className="absolute top-4 right-4 p-2 bg-blue-100 rounded-full text-blue-600">
              <ClipboardList size={20} />
            </div>
            
            <h3 className="text-xl font-bold mb-2 pr-10">{p.name}</h3> {/* Added pr-10 for icon space */}

            <p className="text-gray-600 text-sm mb-4">{p.description}</p>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <IndianRupee size={18} className="text-green-600" />
                <span className="font-semibold text-lg">₹{p.price}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock size={18} />
                <span>{p.durationDays} days</span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => openModal(p)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 
                  bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Pencil size={18} /> Edit
              </button>

              <button
                onClick={() => deletePlan(p.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 
                  bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 size={18} /> Delete
              </button>
            </div>
          </div>
        ))}

        {plans.length === 0 && (
          <p className="text-gray-600 text-center col-span-full">
            No plans found.
          </p>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-xl shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">
              {editPlan ? "Edit Plan" : "Add Plan"}
            </h2>

            <div className="space-y-3">
              <input
                name="name"
                value={form.name}
                onChange={updateForm}
                placeholder="Plan Name"
                className="w-full p-2 border rounded"
              />

              <input
                name="description"
                value={form.description}
                onChange={updateForm}
                placeholder="Description"
                className="w-full p-2 border rounded"
              />

              <input
                name="price"
                value={form.price}
                onChange={updateForm}
                type="number"
                placeholder="Price"
                className="w-full p-2 border rounded"
              />

              <input
                name="durationDays"
                value={form.durationDays}
                onChange={updateForm}
                type="number"
                placeholder="Duration (Days)"
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={savePlan}
                className="px-4 py-2 bg-gradient-to-r 
                  from-[var(--color-primary)] to-[var(--color-accent)] 
                  text-white rounded-lg shadow-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
