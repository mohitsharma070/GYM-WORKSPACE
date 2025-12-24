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
  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;
  
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg p-6 rounded-xl border border-purple-200">
      <div className="flex items-center mb-4">
        <div className="w-3 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full mr-3"></div>
        <h2 className="text-xl font-semibold text-gray-800">12-Month Trend</h2>
      </div>
      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name.includes('Revenue')) {
                return [formatCurrency(value), name];
              }
              return [value, name];
            }}
            labelStyle={{ color: '#374151' }}
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line 
            type="monotone" 
            dataKey="planRevenue" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
          />
          <Line 
            type="monotone" 
            dataKey="productRevenue" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
          />
          <Line 
            type="monotone" 
            dataKey="members" 
            stroke="#f59e0b" 
            strokeWidth={3}
            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, stroke: '#f59e0b', strokeWidth: 2, fill: '#ffffff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
