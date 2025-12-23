import { useState } from "react";

interface Props {
  onClose: () => void;
  onSave: (data: any) => void;
  creating?: boolean;
}

export default function AddTrainerModal({ onClose, onSave, creating = false }: Props) {
  const [form, setForm] = useState({
    name: "",
    dateOfBirth: "",
    email: "",
    password: "",
    specialization: "",
    experienceYears: "",
    certification: "",
    phone: "",
  });

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    if (!form.name || !form.email || !form.password) {
      alert("Name, Email, and Password are required");
      return;
    }

    onSave({
      name: form.name,
      dateOfBirth: form.dateOfBirth,
      email: form.email,
      password: form.password,
      specialization: form.specialization,
      experienceYears: Number(form.experienceYears),
      certification: form.certification,
      phone: form.phone,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add Trainer</h2>

        <div className="space-y-3">


          <input
            type="text"
            placeholder="Full Name"
            className="w-full border p-2 rounded"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />

          <label className="block text-sm text-gray-600 mb-1">Date of Birth</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={form.dateOfBirth}
            onChange={(e) => updateField("dateOfBirth", e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-2 rounded"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
          />

          <input
            type="text"
            placeholder="Specialization"
            className="w-full border p-2 rounded"
            value={form.specialization}
            onChange={(e) => updateField("specialization", e.target.value)}
          />

          <input
            type="number"
            placeholder="Experience (Years)"
            className="w-full border p-2 rounded"
            value={form.experienceYears}
            onChange={(e) => updateField("experienceYears", e.target.value)}
          />

          <input
            type="text"
            placeholder="Certification"
            className="w-full border p-2 rounded"
            value={form.certification}
            onChange={(e) => updateField("certification", e.target.value)}
          />

          <input
            type="text"
            placeholder="Phone"
            className="w-full border p-2 rounded"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={creating}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {creating ? "Adding..." : "Add Trainer"}
          </button>
        </div>
      </div>
    </div>
  );
}
