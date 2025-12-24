import React, { useState } from "react";
import InfoDialog from "./InfoDialog";
import { CheckCircle, User as UserIcon, FileText, CreditCard, Hash } from "lucide-react";


interface ManualReceiptFormProps {
  onSubmit: (data: {
    userId: number;
    planId: number;
    amount?: string;
    paymentMethod?: string;
    transactionId?: string;
  }) => void;
  user: { id: number; name: string };
  plan: { id: number; name: string; price: number };
}

const ManualReceiptForm: React.FC<ManualReceiptFormProps> = ({ onSubmit, user, plan }) => {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [infoDialogMessage, setInfoDialogMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      userId: user.id,
      planId: plan.id,
      amount: String(plan.price),
      paymentMethod,
      transactionId
    });
    setInfoDialogMessage("Receipt sent!");
    setInfoDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
        <FileText className="text-blue-500" size={22} /> Manual Receipt Details
      </h3>
      <div className="bg-white/60 rounded-xl shadow p-6 mb-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-2">
            <UserIcon className="text-gray-500" size={18} />
            <label className="font-medium w-32">User:</label>
            <input value={user.name} type="text" readOnly className="bg-gray-100 rounded px-3 py-1 w-full" />
          </div>
          <div className="flex items-center gap-2">
            <FileText className="text-gray-500" size={18} />
            <label className="font-medium w-32">Plan:</label>
            <input value={plan.name} type="text" readOnly className="bg-gray-100 rounded px-3 py-1 w-full" />
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="text-gray-500" size={18} />
            <label className="font-medium w-32">Amount:</label>
            <input value={String(plan.price)} type="text" readOnly className="bg-gray-100 rounded px-3 py-1 w-full" />
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="text-green-500" size={18} />
            <label className="font-medium w-32">Payment Method:</label>
            <input value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} type="text" placeholder="e.g. Cash, UPI, Card" className="border rounded px-3 py-1 w-full" />
          </div>
          <div className="flex items-center gap-2">
            <Hash className="text-purple-500" size={18} />
            <label className="font-medium w-32">Transaction ID:</label>
            <input value={transactionId} onChange={e => setTransactionId(e.target.value)} type="text" placeholder="Enter transaction/reference ID" className="border rounded px-3 py-1 w-full" />
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition">Send Receipt</button>
        </form>
        <InfoDialog
          isOpen={infoDialogOpen}
          onClose={() => setInfoDialogOpen(false)}
          title="Success"
          message={infoDialogMessage}
        />
      </div>
    </div>
  );
};

export default ManualReceiptForm;
