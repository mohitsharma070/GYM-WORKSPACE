// Example usage of ManualReceiptForm in a page or modal
import React from "react";
import ManualReceiptForm from "../../components/ManualReceiptForm";

// Dummy data for users and plans (replace with real API data)
const users = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Smith" },
];
const plans = [
  { id: 101, name: "Gold Plan", price: 100 },
  { id: 102, name: "Silver Plan", price: 80 },
];

const sendManualReceipt = async (data: {
  userId: number;
  planId: number;
  amount?: string;
  paymentMethod?: string;
  transactionId?: string;
}) => {
  // Replace with your backend API endpoint
  await fetch("/api/membership/manual-receipt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  alert("Receipt sent!");
};


import { useState } from "react";

const ManualReceiptPage: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || 0);
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || 0);

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0];
  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[0];

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Send Manual Membership Receipt</h1>
      <div className="mb-4 flex gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">User</label>
          <select
            className="border rounded px-2 py-1"
            value={selectedUserId}
            onChange={e => setSelectedUserId(Number(e.target.value))}
          >
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Plan</label>
          <select
            className="border rounded px-2 py-1"
            value={selectedPlanId}
            onChange={e => setSelectedPlanId(Number(e.target.value))}
          >
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.name}</option>
            ))}
          </select>
        </div>
      </div>
      <ManualReceiptForm user={selectedUser} plan={selectedPlan} onSubmit={sendManualReceipt} />
    </div>
  );
};

export default ManualReceiptPage;
