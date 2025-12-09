// src/components/MemberChart.tsx

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

interface MemberChartProps {
  data: { name: string; ThisMonth: number; LastMonth: number }[];
}

export const MemberChart: React.FC<MemberChartProps> = ({ data }) => {
  return (
    <div className="bg-white shadow p-6 rounded-lg mb-10">
      <h2 className="text-2xl font-bold mb-3">Members Overview</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="ThisMonth" fill="#9333ea" />
          <Bar dataKey="LastMonth" fill="#f59e0b" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
