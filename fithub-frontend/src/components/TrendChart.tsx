// src/components/TrendChart.tsx

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

interface TrendChartProps {
  data: {
    name: string;
    planRevenue: number;
    productRevenue: number;
    members: number;
  }[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  return (
    <div className="bg-white shadow p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-3">12-Month Trend</h2>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="planRevenue" stroke="#2563eb" strokeWidth={2} />
          <Line type="monotone" dataKey="productRevenue" stroke="#16a34a" strokeWidth={2} />
          <Line type="monotone" dataKey="members" stroke="#dc2626" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
