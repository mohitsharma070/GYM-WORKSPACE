// src/components/RevenueChart.tsx

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

interface RevenueChartProps {
  data: { name: string; Plan: number; Product: number; Total: number }[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  return (
    <div className="bg-white shadow p-6 rounded-lg mb-10">
      <h2 className="text-2xl font-bold mb-3">Revenue Overview</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Plan" fill="#2563eb" />
          <Bar dataKey="Product" fill="#16a34a" />
          <Bar dataKey="Total" fill="#dc2626" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
