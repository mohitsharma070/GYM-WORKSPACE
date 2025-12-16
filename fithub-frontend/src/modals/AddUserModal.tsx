import type { Plan } from "../types/Plan";

interface AddUserModalProps {
  newUser: any;
  setNewUser: (val: any) => void;
  plans: Plan[];
  creating: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function AddUserModal({
  newUser,
  setNewUser,
  plans,
  creating,
  onClose,
  onSave,
}: AddUserModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-auto shadow-lg">

        <h2 className="text-xl font-bold mb-4">Add New Member</h2>

        <div className="space-y-3">

          {/* NAME */}
          <input
            className="w-full border p-2 rounded"
            placeholder="Full Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />

          {/* EMAIL */}
          <input
            className="w-full border p-2 rounded"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />

          {/* PASSWORD */}
          <input
            type="password"
            className="w-full border p-2 rounded"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />

          {/* GENDER */}
          <select
            className="w-full border p-2 rounded"
            value={newUser.memberDetails.gender}
            onChange={(e) =>
              setNewUser({
                ...newUser,
                memberDetails: {
                  ...newUser.memberDetails,
                  gender: e.target.value,
                },
              })
            }
          >
            <option value="">Gender</option>
            <option>Male</option>
            <option>Female</option>
          </select>

          {/* PHONE */}
          <input
            className="w-full border p-2 rounded"
            placeholder="Phone"
            value={newUser.memberDetails.phone}
            onChange={(e) =>
              setNewUser({
                ...newUser,
                memberDetails: {
                  ...newUser.memberDetails,
                  phone: e.target.value,
                },
              })
            }
          />

          {/* HEIGHT */}
          <input
            className="w-full border p-2 rounded"
            placeholder="Height (cm)"
            value={newUser.memberDetails.height}
            onChange={(e) =>
              setNewUser({
                ...newUser,
                memberDetails: {
                  ...newUser.memberDetails,
                  height: e.target.value,
                },
              })
            }
          />

          {/* WEIGHT */}
          <input
            className="w-full border p-2 rounded"
            placeholder="Weight (kg)"
            value={newUser.memberDetails.weight}
            onChange={(e) =>
              setNewUser({
                ...newUser,
                memberDetails: {
                  ...newUser.memberDetails,
                  weight: e.target.value,
                },
              })
            }
          />

          {/* GOAL */}
          <input
            className="w-full border p-2 rounded"
            placeholder="Goal"
            value={newUser.memberDetails.goal}
            onChange={(e) =>
              setNewUser({
                ...newUser,
                memberDetails: {
                  ...newUser.memberDetails,
                  goal: e.target.value,
                },
              })
            }
          />

          {/* PLAN DROPDOWN */}
          <label className="text-sm text-gray-600">Assign Plan (optional)</label>
          <select
            className="w-full border p-2 rounded"
            value={newUser.memberDetails.membershipType}
            onChange={(e) =>
              setNewUser({
                ...newUser,
                memberDetails: {
                  ...newUser.memberDetails,
                  membershipType: e.target.value,
                },
              })
            }
          >
            <option value="">No Plan</option>
            {plans.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name} — ₹{p.price} — {p.durationDays} days
              </option>
            ))}
          </select>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>

          <button
            onClick={onSave}
            disabled={creating}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {creating ? "Creating..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
