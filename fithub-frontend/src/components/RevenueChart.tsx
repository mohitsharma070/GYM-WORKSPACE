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
  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;
  
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg p-6 rounded-xl border border-green-200">
      <div className="flex items-center mb-4">
        <div className="w-3 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full mr-3"></div>
        <h2 className="text-xl font-semibold text-gray-800">Revenue Overview</h2>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
          <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis tickFormatter={formatCurrency} tick={{ fill: '#6b7280', fontSize: 12 }} />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), '']} 
            labelStyle={{ color: '#374151' }}
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="Plan" fill="url(#planGradient)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Product" fill="url(#productGradient)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Total" fill="url(#totalGradient)" radius={[4, 4, 0, 0]} />
          <defs>
            <linearGradient id="planGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.8}/>
            </linearGradient>
            <linearGradient id="productGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
            </linearGradient>
            <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#d97706" stopOpacity={0.8}/>
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
