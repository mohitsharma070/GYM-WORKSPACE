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
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  status?: 'active' | 'expired' | 'pending' | 'inactive';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  currency,
  icon: Icon,
  description,
  microMetric,
  microMetricType = 'neutral',
  variant = 'default',
  status,
}) => {
  const microMetricColor = microMetricType === 'positive' ? 'text-green-600' :
                           microMetricType === 'negative' ? 'text-red-600' : 'text-gray-500';

  const getIconColor = () => {
    if (status === 'expired' || variant === 'error') return 'bg-gradient-to-br from-red-100 to-red-200 text-red-600';
    if (status === 'pending' || variant === 'warning') return 'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-600';
    if (status === 'active' || variant === 'success') return 'bg-gradient-to-br from-green-100 to-green-200 text-green-600';
    if (variant === 'info') return 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600';
    return 'bg-gradient-to-br from-green-100 to-green-200 text-green-600';
  };

  const getCardStyle = () => {
    if (status === 'expired' || variant === 'error') return 'border-red-200 bg-gradient-to-br from-red-50 to-white hover:from-red-100';
    if (status === 'pending' || variant === 'warning') return 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-white hover:from-yellow-100';
    if (status === 'active' || variant === 'success') return 'border-green-200 bg-gradient-to-br from-green-50 to-white hover:from-green-100';
    if (variant === 'info') return 'border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:from-blue-100';
    return 'border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:from-gray-100';
  };

  return (
    <div className={`shadow-md border p-6 rounded-xl flex flex-col justify-between h-full hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ${getCardStyle()}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700 text-base">{title}</h3>
        {Icon && (
          <div className={`p-3 rounded-xl shadow-sm ${getIconColor()}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="flex-1">
        <p className="text-3xl font-bold text-gray-900 mb-3">
          {currency && <span className="text-2xl text-gray-600">{currency}</span>}
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {description && <p className="text-sm text-gray-600 mb-2 leading-relaxed">{description}</p>}
        {microMetric && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className={`text-sm font-medium ${microMetricColor}`}>{microMetric}</p>
          </div>
        )}
      </div>
    </div>
  );
};
