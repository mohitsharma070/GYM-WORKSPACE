// src/components/AnalyticsStatCards.tsx

import React from "react";
import { StatCard } from "./StatCard";
import type { Stats } from "../types/Stats"; // Assuming Stats type is available
import { DollarSign, ShoppingCart, Users, UserPlus, Package, Wallet } from "lucide-react"; // Import necessary icons

interface AnalyticsStatCardsProps {
  stats: Stats;
}

export const AnalyticsStatCards: React.FC<AnalyticsStatCardsProps> = ({ stats }) => {
  const membersJoinedTrend: 'positive' | 'negative' | 'neutral' =
    stats.membersThisMonth > stats.membersLastMonth ? 'positive' :
    stats.membersThisMonth < stats.membersLastMonth ? 'negative' : 'neutral';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
      <StatCard
        title="Plan Revenue"
        value={stats.planRevenue}
        currency="₹"
        icon={Wallet}
        description="Revenue from membership plans"
      />
      <StatCard
        title="Product Revenue"
        value={stats.productRevenue}
        currency="₹"
        icon={ShoppingCart}
        description="Revenue from product sales"
      />
      <StatCard
        title="Total Revenue"
        value={stats.totalRevenue}
        currency="₹"
        icon={DollarSign}
        description="Combined revenue this month"
      />
      <StatCard
        title="Products Sold"
        value={stats.productsSoldThisMonth}
        icon={Package}
        description="Units sold this month"
        microMetric={`Total: ${stats.totalProductsSold}`}
      />
      <StatCard
        title="Total Members"
        value={stats.totalMembers}
        icon={Users}
        description="All active members"
      />
      <StatCard
        title="Members Joined"
        value={stats.membersThisMonth}
        icon={UserPlus}
        description="New members this month"
        microMetric={`Last month: ${stats.membersLastMonth}`}
        microMetricType={membersJoinedTrend}
      />
    </div>
  );
};
