// src/pages/admin/AnalyticsPage.tsx

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";

import { useAnalytics, useAnalyticsTrend } from "../../hooks/useAnalytics";

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
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>

      {/* FILTERS */}
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

        <button
          onClick={() => {
            analyticsQuery.refetch();
            trendQuery.refetch();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Refresh
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-white shadow p-6 rounded-lg">
          <h3 className="font-semibold text-gray-700">Plan Revenue</h3>
          <p className="text-3xl font-bold">₹{stats.planRevenue}</p>
        </div>

        <div className="bg-white shadow p-6 rounded-lg">
          <h3 className="font-semibold text-gray-700">Product Revenue</h3>
          <p className="text-3xl font-bold">₹{stats.productRevenue}</p>
        </div>

        <div className="bg-white shadow p-6 rounded-lg">
          <h3 className="font-semibold text-gray-700">Total Revenue</h3>
          <p className="text-3xl font-bold">₹{stats.totalRevenue}</p>
        </div>

        <div className="bg-white shadow p-6 rounded-lg">
          <h3 className="font-semibold text-gray-700">Products Sold</h3>
          <p className="text-3xl font-bold">{stats.productsSoldThisMonth}</p>
        </div>

        <div className="bg-white shadow p-6 rounded-lg">
          <h3 className="font-semibold text-gray-700">Total Members</h3>
          <p className="text-3xl font-bold">{stats.totalMembers}</p>
        </div>

        <div className="bg-white shadow p-6 rounded-lg">
          <h3 className="font-semibold text-gray-700">Members Joined</h3>
          <p className="text-3xl font-bold">{stats.membersThisMonth}</p>
        </div>
      </div>

      {/* REVENUE CHART */}
      <h2 className="text-2xl font-bold mb-3">Revenue Overview</h2>
      <div className="bg-white shadow p-6 rounded-lg mb-10">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Plan" fill="#2563eb" />
            <Bar dataKey="Product" fill="#16a34a" />
            <Bar dataKey="Total" fill="#dc2626" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* MEMBERS */}
      <h2 className="text-2xl font-bold mb-3">Members Overview</h2>
      <div className="bg-white shadow p-6 rounded-lg mb-10">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={memberChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="ThisMonth" fill="#9333ea" />
            <Bar dataKey="LastMonth" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TREND */}
      <h2 className="text-2xl font-bold mb-3">12-Month Trend</h2>
      <div className="bg-white shadow p-6 rounded-lg">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="planRevenue" stroke="#2563eb" strokeWidth={2} />
            <Line type="monotone" dataKey="productRevenue" stroke="#16a34a" strokeWidth={2} />
            <Line type="monotone" dataKey="members" stroke="#dc2626" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
