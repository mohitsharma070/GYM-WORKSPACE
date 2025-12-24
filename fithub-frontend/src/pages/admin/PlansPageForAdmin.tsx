import { useEffect, useState } from "react";
import React, { useState, useEffect } from "react";
import InfoDialog from "../../components/InfoDialog";
import { Plus, Pencil, Trash2, IndianRupee, Clock, ClipboardList } from "lucide-react";
import PageHeader from '../../components/PageHeader';
import { Button } from '../../components/Button';

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
  // InfoDialog state
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [infoDialogMessage, setInfoDialogMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    durationDays: "",
  });

  // Alternate color themes for plan cards
  const colorThemes = [
    { bg: 'bg-gradient-to-br from-blue-50 to-blue-100', border: 'border-blue-200', icon: 'bg-blue-100 text-blue-600' },
    { bg: 'bg-gradient-to-br from-purple-50 to-purple-100', border: 'border-purple-200', icon: 'bg-purple-100 text-purple-600' },
    { bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100', border: 'border-emerald-200', icon: 'bg-emerald-100 text-emerald-600' },
    { bg: 'bg-gradient-to-br from-amber-50 to-amber-100', border: 'border-amber-200', icon: 'bg-amber-100 text-amber-600' },
    { bg: 'bg-gradient-to-br from-rose-50 to-rose-100', border: 'border-rose-200', icon: 'bg-rose-100 text-rose-600' },
    { bg: 'bg-gradient-to-br from-cyan-50 to-cyan-100', border: 'border-cyan-200', icon: 'bg-cyan-100 text-cyan-600' },
  ];

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
      setInfoDialogMessage("Failed to save plan");
      setInfoDialogOpen(true);
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
      setInfoDialogMessage("Delete failed");
      setInfoDialogOpen(true);
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
          <Button onClick={() => openModal()}>
            <Plus size={20} /> Add Plan
          </Button>
        }
      />

      {/* PLANS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.map((p, index) => {
          const theme = colorThemes[index % colorThemes.length];
          return (
          <div
            key={p.id}
            className={`${theme.bg} shadow-sm rounded-lg p-6 border ${theme.border} hover:shadow-lg transition-all group relative`}
          >
            <div className={`absolute top-4 right-4 p-2 ${theme.icon} rounded-full group-hover:shadow-md transition-all`}>
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => openModal(p)}
                className="flex-1"
              >
                <Pencil size={16} className="mr-1" /> Edit
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => deletePlan(p.id)}
                className="flex-1"
              >
                <Trash2 size={16} className="mr-1" /> Delete
              </Button>
            </div>
          </div>
        );
        })}

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
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
          <div
            className="p-8 rounded-lg w-full max-w-md shadow-xl"
            style={{
              background: '#F5F3EE',
              border: '1px solid #E5E7EB',
              boxShadow: '0 8px 40px 0 rgba(16, 30, 54, 0.18)',
              color: '#1E293B',
            }}
          >
            <h2 className="text-2xl font-semibold mb-6" style={{color:'#1E293B'}}>
              {editPlan ? "Edit Plan" : "Add New Plan"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Plan Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={updateForm}
                  placeholder="Enter plan name"
                  className="w-full border p-2 rounded"
                  style={{border: '1px solid #E5E7EB', color: '#1E293B', background: '#F5F3EE'}}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Description</label>
                <input
                  name="description"
                  value={form.description}
                  onChange={updateForm}
                  placeholder="Enter description"
                  className="w-full border p-2 rounded"
                  style={{border: '1px solid #E5E7EB', color: '#1E293B', background: '#F5F3EE'}}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Price (₹)</label>
                <input
                  name="price"
                  value={form.price}
                  onChange={updateForm}
                  type="number"
                  placeholder="Enter price"
                  className="w-full border p-2 rounded"
                  style={{border: '1px solid #E5E7EB', color: '#1E293B', background: '#F5F3EE'}}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Duration (Days)</label>
                <input
                  name="durationDays"
                  value={form.durationDays}
                  onChange={updateForm}
                  type="number"
                  placeholder="Enter duration in days"
                  className="w-full border p-2 rounded"
                  style={{border: '1px solid #E5E7EB', color: '#1E293B', background: '#F5F3EE'}}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>

              <Button
                onClick={savePlan}
              >
                {editPlan ? "Update Plan" : "Create Plan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
      {/* InfoDialog for alerts */}
      <InfoDialog
        isOpen={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        title="Notice"
        message={infoDialogMessage}
      />
  );
}
