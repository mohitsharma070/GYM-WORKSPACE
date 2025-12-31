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
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg p-6 rounded-xl border border-blue-200">
      <div className="flex items-center mb-4">
        <div className="w-3 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3"></div>
        <h2 className="text-xl font-semibold text-gray-800">Members Overview</h2>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
          <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
          <Tooltip 
            labelStyle={{ color: '#374151' }}
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="ThisMonth" fill="url(#thisMonthGradient)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="LastMonth" fill="url(#lastMonthGradient)" radius={[4, 4, 0, 0]} />
          <defs>
            <linearGradient id="thisMonthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.8}/>
            </linearGradient>
            <linearGradient id="lastMonthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#d97706" stopOpacity={0.8}/>
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
