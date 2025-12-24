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
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'destructive' | 'hotpink' | 'themedblue';
  status?: 'active' | 'expired' | 'pending' | 'inactive';
  onClick?: () => void; // Optional click handler
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
  onClick,
}) => {
  const microMetricColor = microMetricType === 'positive' ? 'text-green-600' :
                           microMetricType === 'negative' ? 'text-red-600' : 'text-gray-500';

  const getIconColor = () => {
    if (status === 'expired' || variant === 'error' || variant === 'destructive') return 'bg-gradient-to-br from-red-200 to-red-400 text-red-700';
    if (status === 'pending' || variant === 'warning') return 'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-600';
    if (status === 'active' || variant === 'success') return 'bg-gradient-to-br from-green-100 to-green-200 text-green-600';
    if (variant === 'info') return 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600';
    if (variant === 'hotpink') return 'bg-pink-100 text-pink-600';
    if (variant === 'themedblue') return 'bg-blue-100 text-blue-600';
    return 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600';
  };

  const getCardStyle = () => {
    if (status === 'expired' || variant === 'error' || variant === 'destructive') return 'border-red-300 bg-gradient-to-br from-red-100 to-red-50 hover:from-red-200';
    if (status === 'pending' || variant === 'warning') return 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-white hover:from-yellow-100';
    if (status === 'active' || variant === 'success') return 'border-green-200 bg-gradient-to-br from-green-50 to-white hover:from-green-100';
    if (variant === 'info') return 'border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:from-blue-100';
    if (variant === 'hotpink') return 'border-pink-400 bg-white hover:bg-pink-50';
    if (variant === 'themedblue') return 'border-blue-400 bg-white hover:bg-blue-50';
    return 'border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:from-gray-100';
  };

  return (
    <div
      className={`shadow-md border p-6 rounded-xl flex flex-col justify-between h-full hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ${getCardStyle()}`}
      onClick={onClick} // Add click handler
    >
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
