// src/components/AnalyticsStatCards.tsx

import React from "react";
import { StatCard } from "./StatCard";
import type { Stats } from "../types/Stats"; // Assuming Stats type is available

interface AnalyticsStatCardsProps {
  stats: Stats;
}

export const AnalyticsStatCards: React.FC<AnalyticsStatCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-3 gap-6 mb-10">
      <StatCard title="Plan Revenue" value={stats.planRevenue} currency="₹" />
      <StatCard title="Product Revenue" value={stats.productRevenue} currency="₹" />
      <StatCard title="Total Revenue" value={stats.totalRevenue} currency="₹" />
      <StatCard title="Products Sold" value={stats.productsSoldThisMonth} />
      <StatCard title="Total Members" value={stats.totalMembers} />
      <StatCard title="Members Joined" value={stats.membersThisMonth} />
    </div>
  );
};
