// src/modals/EditTrainerModal.tsx
import { useEffect, useState } from "react";

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
    onUpdated(form);         // FIXED: pass form data to parent
    onClose();               // close modal
  }

  if (!show || !trainer) return null;

  return (
    <div className="modal-overlay fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="modal-container bg-white p-6 rounded shadow-lg w-full max-w-lg">
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
