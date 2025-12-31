// src/modals/EditTrainerModal.tsx
import { useEffect, useState } from "react";
import { normalizePhoneInput } from "../utils/phone";

interface EditTrainerModalProps {
  trainer: any | null;
  show: boolean;
  onClose: () => void;
  onUpdated: (data: any) => void; // FIXED: now expects data
}

export default function EditTrainerModal({
  trainer,
  show,
  onClose,
  onUpdated,
}: EditTrainerModalProps) {
  const [form, setForm] = useState({
    name: "",
    dateOfBirth: "",
    email: "",
    specialization: "",
    experienceYears: "",
    certification: "",
    phone: "",
  });

  // sync trainer values into the form
  useEffect(() => {
    if (trainer) {
      setForm({
        name: trainer.name ?? "",
        dateOfBirth: trainer.dateOfBirth ?? "",
        email: trainer.email ?? "",
        specialization: trainer.trainerDetails?.specialization ?? "",
        experienceYears: trainer.trainerDetails?.experienceYears ?? "",
        certification: trainer.trainerDetails?.certification ?? "",
        phone: trainer.trainerDetails?.phone ?? "",
      });
    }
  }, [trainer]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSave() {
    // DO NOT call updateTrainer here → parent should handle it
    onUpdated({ ...form, phone: normalizePhoneInput(form.phone) }); // Pass normalized phone to parent
    onClose();               // close modal
  }

  if (!show || !trainer) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div
        className="p-6 rounded-lg w-96 max-h-[90vh] overflow-auto"
        style={{
          background: '#F5F3EE',
          border: '1px solid #E5E7EB',
          boxShadow: '0 8px 40px 0 rgba(16, 30, 54, 0.18)',
          color: '#1E293B',
        }}
      >
        <h2 className="text-2xl font-bold mb-4">Edit Trainer</h2>

        <div className="space-y-4">

          <div>
            <label className="block">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleChange}
              className="input w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block">Specialization</label>
            <input
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              className="input w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block">Experience (Years)</label>
            <input
              type="number"
              name="experienceYears"
              value={form.experienceYears}
              onChange={handleChange}
              className="input w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block">Certification</label>
            <input
              name="certification"
              value={form.certification}
              onChange={handleChange}
              className="input w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              onBlur={(e) => setForm({ ...form, phone: normalizePhoneInput(e.target.value) })}
              className="input w-full border p-2 rounded"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
