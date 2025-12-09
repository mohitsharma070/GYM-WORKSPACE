// src/components/StatCard.tsx

import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  currency?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, currency }) => {
  return (
    <div className="bg-white shadow p-6 rounded-lg">
      <h3 className="font-semibold text-gray-700">{title}</h3>
      <p className="text-3xl font-bold">{currency}{value}</p>
    </div>
  );
};
