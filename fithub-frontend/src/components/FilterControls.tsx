// src/components/FilterControls.tsx

import React from "react";
import { RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface FilterControlsProps {
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  onRefresh: () => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  onRefresh,
}) => {
  const now = new Date();

  return (
    <div className="flex gap-4 mb-8">
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(Number(e.target.value))}
        className="border px-3 py-2 rounded"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <option key={i + 1} value={i + 1}>
            {new Date(0, i).toLocaleString("default", { month: "long" })}
          </option>
        ))}
      </select>

      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(Number(e.target.value))}
        className="border px-3 py-2 rounded"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <option key={i} value={now.getFullYear() - i}>
            {now.getFullYear() - i}
          </option>
        ))}
      </select>

      <Button onClick={onRefresh}>
        <RefreshCw size={16} className="mr-2" />
        Refresh
      </Button>
    </div>
  );
};
