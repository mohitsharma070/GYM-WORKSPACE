import React from "react";
import type { User } from "../types/User";
import type { Plan } from "../types/Plan";
import { Button } from "../components/Button";

interface RenewPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: User | null;
  plans: Plan[];
  onRenew: (memberId: number, planId: number) => void;
}

const RenewPlanModal: React.FC<RenewPlanModalProps> = ({ isOpen, onClose, member, plans, onRenew }) => {
  const [selectedPlanId, setSelectedPlanId] = React.useState<number | null>(null);
  React.useEffect(() => {
    if (plans.length > 0) setSelectedPlanId(plans[0].id);
  }, [plans, isOpen]);
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-blue-50 rounded-lg shadow-lg p-12 w-full max-w-2xl mx-4 border border-blue-200">
        <h2 className="text-2xl font-semibold mb-6">Renew Membership Plan</h2>
        <p className="mb-6 text-lg">Renew plan for <span className="font-bold">{member.name}</span>?</p>
        <select
          className="w-full border p-2 rounded mb-6"
          value={selectedPlanId ?? ''}
          onChange={e => setSelectedPlanId(Number(e.target.value))}
        >
          {plans.map(plan => (
            <option key={plan.id} value={plan.id}>{plan.name} (₹{plan.price}, {plan.durationDays} days)</option>
          ))}
        </select>
        <div className="flex justify-end gap-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="default" onClick={() => selectedPlanId && onRenew(member.id, selectedPlanId)}>Renew</Button>
        </div>
      </div>
    </div>
  );
};

export default RenewPlanModal;
