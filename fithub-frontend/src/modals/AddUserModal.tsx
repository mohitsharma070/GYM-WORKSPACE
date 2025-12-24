import type { Plan } from "../types/Plan";
import { Button } from '../components/Button';

import { initiateFingerprintScan } from '../utils/fingerprintScanner';

interface AddUserModalProps {
  newUser: any;
  setNewUser: (val: any) => void;
  plans: Plan[];
  loading: boolean;
  onClose: () => void;
  handleSubmit: () => void;
}

export default function AddUserModal({
  newUser,
  setNewUser,
  plans,
  loading,
  onClose,
  handleSubmit,
}: AddUserModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div
        className="p-6 rounded-lg w-96 max-h-[90vh] overflow-auto shadow-lg"
        style={{
          background: '#F5F3EE',
          border: '1px solid #E5E7EB',
          boxShadow: '0 8px 40px 0 rgba(16, 30, 54, 0.18)',
          color: '#1E293B',
        }}
      >

        <h2 className="text-xl font-bold mb-4">Add New Member</h2>

        <div className="space-y-3">


          {/* FINGERPRINT SCAN */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Fingerprint</label>
            <div className="flex gap-2 items-center">
              <input
                className="w-full border p-2 rounded bg-gray-100"
                placeholder="Scan fingerprint..."
                value={newUser.memberDetails?.fingerprint || ''}
                readOnly
              />
              <Button
                type="button"
                variant="default"
                onClick={async () => {
                  try {
                    const fp = await initiateFingerprintScan();
                    setNewUser({
                      ...newUser,
                      memberDetails: {
                        ...newUser.memberDetails,
                        fingerprint: fp,
                      },
                    });
                  } catch (e: any) {
                    alert(e.message || 'Fingerprint scan failed');
                  }
                }}
              >
                Scan
              </Button>
            </div>
          </div>

          {/* NAME */}
          <input
            className="w-full border p-2 rounded"
            placeholder="Full Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />

          {/* DATE OF BIRTH */}
          <label className="block text-sm text-gray-600 mb-1">Date of Birth</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={newUser.dateOfBirth || ''}
            onChange={(e) => setNewUser({ ...newUser, dateOfBirth: e.target.value })}
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
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" variant="default" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Adding...' : 'Add Member'}
          </Button>
        </div>
      </div>
    </div>
  );
}
