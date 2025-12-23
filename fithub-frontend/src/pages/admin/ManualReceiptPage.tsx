// Example usage of ManualReceiptForm in a page or modal
import React from "react";
import ManualReceiptForm from "../../components/ManualReceiptForm";

// Dummy data for users and plans (replace with real API data)
const users = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Smith" },
];
const plans = [
  { id: 101, name: "Gold Plan" },
  { id: 102, name: "Silver Plan" },
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

const ManualReceiptPage: React.FC = () => {
  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Send Manual Membership Receipt</h1>
      <ManualReceiptForm users={users} plans={plans} onSubmit={sendManualReceipt} />
    </div>
  );
};

export default ManualReceiptPage;
