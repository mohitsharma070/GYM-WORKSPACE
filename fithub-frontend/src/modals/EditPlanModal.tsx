import { Save } from 'lucide-react';
import { Button } from '../components/Button';
import type { Plan } from "../types/Plan";

export default function EditPlanModal({
  plans,
  newPlanId,
  setNewPlanId,
  startDate,
  setStartDate,
  onClose,
  onSave,
}: any) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Edit Plan</h2>

        <select
          className="w-full border p-2 rounded"
          value={newPlanId}
          onChange={(e) => setNewPlanId(e.target.value)}
        >
          <option value="">Select</option>
          {plans.map((p: Plan) => (
            <option key={p.id} value={String(p.id)}>
              {p.name} — ₹{p.price} — {p.durationDays} days
            </option>
          ))}
        </select>

        <input
          type="date"
          className="w-full border p-2 rounded mt-4"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave}><Save size={16} className="mr-2" />Save</Button>
        </div>

      </div>
    </div>
  );
}
