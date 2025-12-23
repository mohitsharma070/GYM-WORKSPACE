import { useState } from 'react';
import { Button } from '../components/Button';
import type { User } from "../types/User";
import type { Plan } from "../types/Plan";

interface Props {
  user: User | null;
  plans: Plan[];
  loading: boolean;
  onClose: () => void;
  handleSubmit: (updated: any) => void;
  visible: boolean;
}

export default function EditUserModal({
  user,
  plans,
  loading,
  onClose,
  handleSubmit,
  visible,
}: Props) {
  // If not visible or no user, render nothing
  if (!visible || !user) return null;
  const [form, setForm] = useState<any>({
    name: user.name,
    // Use trainerDetails.dateOfBirth only for trainers, else fallback to user.dateOfBirth
    dateOfBirth: user.role === 'trainer' ? (user as any).trainerDetails?.dateOfBirth || user.dateOfBirth || "" : user.dateOfBirth || "",
    email: user.email,
    age: user.memberDetails?.age || "",
    gender: user.memberDetails?.gender || "",
    height: user.memberDetails?.height || "",
    weight: user.memberDetails?.weight || "",
    goal: user.memberDetails?.goal || "",
    phone: user.memberDetails?.phone || "",
    membershipType: user.memberDetails?.membershipType || "",
  });

  function updateField(key: string, value: any) {
    setForm({ ...form, [key]: value });
  }

  function handleSave() {
    // 🔥 Backend expects FLAT fields, NOT memberDetails object
    const payload = {
      name: form.name,
      dateOfBirth: form.dateOfBirth,
      email: form.email,
      age: Number(form.age),
      gender: form.gender,
      height: Number(form.height),
      weight: Number(form.weight),
      goal: form.goal,
      phone: form.phone,
      membershipType: form.membershipType,
    };

    handleSubmit(payload);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-auto shadow-lg">

        <h2 className="text-xl font-bold mb-4">Edit Member</h2>


        <div className="space-y-3">
          {/* Name */}
          <input
            className="w-full border p-2 rounded"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />

          {/* Date of Birth */}
          <label className="block text-sm text-gray-600 mb-1">Date of Birth</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={form.dateOfBirth}
            onChange={(e) => updateField("dateOfBirth", e.target.value)}
          />

          {/* Email (read only) */}
          <input
            className="w-full border p-2 rounded bg-gray-100"
            placeholder="Email"
            value={form.email}
            readOnly
          />

          {/* Phone */}
          <input
            className="w-full border p-2 rounded"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
          />

          {/* Age + Gender */}
          <div className="flex gap-3">
            <input
              className="w-1/2 border p-2 rounded"
              type="number"
              placeholder="Age"
              value={form.age}
              onChange={(e) => updateField("age", e.target.value)}
            />

            <select
              className="w-1/2 border p-2 rounded"
              value={form.gender}
              onChange={(e) => updateField("gender", e.target.value)}
            >
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Height + Weight */}
          <div className="flex gap-3">
            <input
              className="w-1/2 border p-2 rounded"
              placeholder="Height (cm)"
              value={form.height}
              onChange={(e) => updateField("height", e.target.value)}
            />
            <input
              className="w-1/2 border p-2 rounded"
              placeholder="Weight (kg)"
              value={form.weight}
              onChange={(e) => updateField("weight", e.target.value)}
            />
          </div>

          {/* Goal */}
          <input
            className="w-full border p-2 rounded"
            placeholder="Goal"
            value={form.goal}
            onChange={(e) => updateField("goal", e.target.value)}
          />

          {/* Membership plan */}
          <select
            className="w-full border p-2 rounded"
            value={form.membershipType}
            onChange={(e) => updateField("membershipType", e.target.value)}
          >
            <option value="">Select Plan</option>
            {plans?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — ₹{p.price}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="default" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}