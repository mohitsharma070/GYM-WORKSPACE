// src/pages/admin/AnalyticsPage.tsx

import { useState } from "react";
import { useAnalytics, useAnalyticsTrend } from "../../hooks/useAnalytics";
import { FilterControls } from "../../components/FilterControls";
import { AnalyticsStatCards } from "../../components/AnalyticsStatCards";
import { RevenueChart } from "../../components/RevenueChart";
import { MemberChart } from "../../components/MemberChart";
import { TrendChart } from "../../components/TrendChart";
import { BarChart } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState'; // Import EmptyState

// If Stats type exists in a types file, import it. Otherwise we rely on inference.

export default function AnalyticsPage() {
  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const analyticsQuery = useAnalytics(selectedMonth, selectedYear);
  const trendQuery = useAnalyticsTrend(selectedMonth, selectedYear);

  const loading = analyticsQuery.isLoading || trendQuery.isLoading;
  const error = analyticsQuery.error || trendQuery.error;

  if (loading) return <p className="text-gray-600 mt-10">Loading analytics…</p>;

  if (error)
    return (
      <div className="mt-10">
        <p className="text-red-600">Unable to load analytics data.</p>
        <button
          onClick={() => {
            analyticsQuery.refetch();
            trendQuery.refetch();
          }}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );

  const stats = analyticsQuery.data!;
  const trend = trendQuery.data!;

  // Determine if there's genuinely no data for the selected period
  const noData = stats.totalRevenue === 0 && stats.totalMembers === 0 && trend.length === 0;

  if (noData) {
    return (
      <div>
        <PageHeader
          icon={BarChart}
          title="Analytics"
          subtitle="View your gym's performance and trends."
        />
        <FilterControls
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          onRefresh={() => {
            analyticsQuery.refetch();
            trendQuery.refetch();
          }}
        />
        <EmptyState
          icon={BarChart} // Using BarChart icon for consistency
          title="No analytics data available"
          description={`There's no data for ${selectedMonth}/${selectedYear}. Try selecting a different month or year.`}
          buttonText="Reset to Current Month"
          onButtonClick={() => {
            setSelectedMonth(now.getMonth() + 1);
            setSelectedYear(now.getFullYear());
          }}
        />
      </div>
    );
  }

  const revenueChartData = [
    {
      name: "Revenue",
      Plan: stats.planRevenue,
      Product: stats.productRevenue,
      Total: stats.totalRevenue,
    },
  ];

  const memberChartData = [
    {
      name: "Members",
      ThisMonth: stats.membersThisMonth,
      LastMonth: stats.membersLastMonth,
    },
  ];

  return (
    <div>
      <PageHeader
        icon={BarChart}
        title="Analytics"
        subtitle="View your gym's performance and trends."
      />

      {/* FILTERS */}
      <FilterControls
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        onRefresh={() => {
          analyticsQuery.refetch();
          trendQuery.refetch();
        }}
      />

      {/* STAT CARDS */}
      <AnalyticsStatCards stats={stats} />

      <RevenueChart data={revenueChartData} />

      <MemberChart data={memberChartData} />

      <TrendChart data={trend} />
    </div>
  );
}
