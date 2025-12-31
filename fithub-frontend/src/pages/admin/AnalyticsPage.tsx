// src/pages/admin/AnalyticsPage.tsx

import { useState } from "react";
import { useAnalytics, useAnalyticsTrend } from "../../hooks/useAnalytics";
import { FilterControls } from "../../components/FilterControls";
import { AnalyticsStatCards } from "../../components/AnalyticsStatCards";
import { RevenueChart } from "../../components/RevenueChart";
import { MemberChart } from "../../components/MemberChart";
import { TrendChart } from "../../components/TrendChart";
import { BarChart, TrendingUp, Calendar } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';

// If Stats type exists in a types file, import it. Otherwise we rely on inference.

export default function AnalyticsPage() {
  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const analyticsQuery = useAnalytics(selectedMonth, selectedYear);
  const trendQuery = useAnalyticsTrend(selectedMonth, selectedYear);

  const loading = analyticsQuery.isLoading || trendQuery.isLoading;
  const error = analyticsQuery.error || trendQuery.error;

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader
          icon={BarChart}
          title="Analytics"
          subtitle="View your gym's performance and trends."
        />
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 shadow-sm border border-blue-200">
          <div className="animate-pulse space-y-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <TrendingUp size={32} className="text-blue-500 animate-bounce" />
              </div>
              <h3 className="text-lg font-medium text-gray-700">Loading Analytics Data...</h3>
              <p className="text-gray-500 text-sm mt-2">Gathering insights from your gym's performance</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-white rounded-lg shadow-sm border"></div>
              ))}
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-white rounded-lg shadow-sm border"></div>
              <div className="h-64 bg-white rounded-lg shadow-sm border"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error)
    return (
      <div className="space-y-8">
        <PageHeader
          icon={BarChart}
          title="Analytics"
          subtitle="View your gym's performance and trends."
        />
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 shadow-sm text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart size={32} className="text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">Unable to Load Analytics</h3>
            <p className="text-red-600 mb-6">We couldn't fetch your analytics data. Please check your connection and try again.</p>
            <button
              onClick={() => {
                analyticsQuery.refetch();
                trendQuery.refetch();
              }}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    );

  const stats = analyticsQuery.data!;
  const trend = trendQuery.data!;

  // Determine if there's genuinely no data for the selected period
  const noData = stats.totalRevenue === 0 && stats.totalMembers === 0 && trend.length === 0;

  if (noData) {
    return (
      <div className="space-y-8">
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
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <EmptyState
            icon={BarChart}
            title="No analytics data available"
            description={`There's no data for ${selectedMonth}/${selectedYear}. Try selecting a different month or year.`}
            buttonText="Reset to Current Month"
            onButtonClick={() => {
              setSelectedMonth(now.getMonth() + 1);
              setSelectedYear(now.getFullYear());
            }}
          />
        </div>
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
    <div className="space-y-8">
      <PageHeader
        icon={BarChart}
        title="Analytics"
        subtitle="View your gym's performance and trends."
      />

      {/* FILTERS */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 shadow-sm border border-indigo-200">
        <div className="flex items-center mb-4">
          <Calendar size={20} className="text-indigo-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-800">Filter Analytics</h3>
        </div>
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
      </div>

      {/* STAT CARDS */}
      <AnalyticsStatCards stats={stats} />

      {/* CHARTS */}
      <div className="space-y-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <TrendingUp size={24} className="text-green-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-800">Revenue Analytics</h3>
          </div>
          <RevenueChart data={revenueChartData} />
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <BarChart size={24} className="text-blue-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-800">Member Growth</h3>
          </div>
          <MemberChart data={memberChartData} />
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <TrendingUp size={24} className="text-purple-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-800">Performance Trends</h3>
          </div>
          <TrendChart data={trend} />
        </div>
      </div>
    </div>
  );
}
