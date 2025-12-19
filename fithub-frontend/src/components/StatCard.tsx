// src/components/StatCard.tsx

import React from "react";
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  currency?: string;
  icon?: LucideIcon; // Optional icon component
  description?: string; // Optional secondary text
  microMetric?: string; // Optional micro-metric (e.g., trend)
  microMetricType?: 'positive' | 'negative' | 'neutral'; // For styling microMetric
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  currency,
  icon: Icon,
  description,
  microMetric,
  microMetricType = 'neutral',
}) => {
  const microMetricColor = microMetricType === 'positive' ? 'text-green-600' :
                           microMetricType === 'negative' ? 'text-red-600' : 'text-gray-500';

  return (
    <div className="bg-white shadow p-6 rounded-lg flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700 text-lg">{title}</h3>
        {Icon && (
          <div className="p-2 bg-blue-100 rounded-full text-blue-600">
            <Icon size={20} />
          </div>
        )}
      </div>
      <p className="text-3xl font-bold mb-1">{currency}{value}</p>
      {description && <p className="text-sm text-gray-500 mb-2">{description}</p>}
      {microMetric && <p className={`text-sm font-medium ${microMetricColor}`}>{microMetric}</p>}
    </div>
  );
};
