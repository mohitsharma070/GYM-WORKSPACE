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
  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader
          icon={ClipboardList}
          title="Membership Plans"
          subtitle="Manage your gym's membership plans."
        />
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-8">
        <PageHeader
          icon={ClipboardList}
          title="Membership Plans"
          subtitle="Manage your gym's membership plans."
        />
        
        <div className="bg-white rounded-lg p-8 shadow-sm text-center">
          <div className="max-w-md mx-auto">
            <p className="text-red-600 text-lg font-medium mb-4">{error}</p>
            <button
              onClick={loadPlans}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        icon={ClipboardList}
        title="Membership Plans"
        subtitle="Manage your gym's membership plans."
        actions={
          <button
            onClick={() => openModal()}
            className="px-6 py-2 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
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
            className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 hover:shadow-md transition-all group relative"
          >
            <div className="absolute top-4 right-4 p-2 bg-blue-100 rounded-full text-blue-600 group-hover:bg-blue-200 transition-colors">
              <ClipboardList size={20} />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 pr-12">{p.name}</h3>

            <p className="text-gray-600 text-sm mb-6 line-clamp-2">{p.description}</p>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-green-100 rounded-full">
                  <IndianRupee size={16} className="text-green-600" />
                </div>
                <span className="font-semibold text-lg text-gray-900">₹{p.price}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={16} />
                <span className="text-sm">{p.durationDays} days</span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3">
              <button
                onClick={() => openModal(p)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Pencil size={16} /> Edit
              </button>

              <button
                onClick={() => deletePlan(p.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        ))}

        {plans.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-3">
              <ClipboardList size={48} className="mx-auto" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No membership plans found</p>
            <p className="text-gray-400 text-sm mt-1">Create your first plan to get started</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {editPlan ? "Edit Plan" : "Add New Plan"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={updateForm}
                  placeholder="Enter plan name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  name="description"
                  value={form.description}
                  onChange={updateForm}
                  placeholder="Enter description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                <input
                  name="price"
                  value={form.price}
                  onChange={updateForm}
                  type="number"
                  placeholder="Enter price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Days)</label>
                <input
                  name="durationDays"
                  value={form.durationDays}
                  onChange={updateForm}
                  type="number"
                  placeholder="Enter duration in days"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>

              <button
                onClick={savePlan}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                {editPlan ? "Update Plan" : "Create Plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
