import React from "react";
import { StatCard } from "./StatCard";
import { CalendarCheck, CalendarX, Flame, Clock } from "lucide-react";

export interface AttendanceStats {
  totalCheckIns: number;
  totalCheckOuts: number;
  currentStreak: number;
  totalDaysPresent: number;
}

interface AttendanceStatCardsProps {
  stats: AttendanceStats;
}

export const AttendanceStatCards: React.FC<AttendanceStatCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Total Check-ins"
        value={stats.totalCheckIns}
        icon={CalendarCheck}
        description="Number of times you checked in"
        variant="success"
      />
      <StatCard
        title="Total Check-outs"
        value={stats.totalCheckOuts}
        icon={CalendarX}
        description="Number of times you checked out"
        variant="info"
      />
      <StatCard
        title="Current Streak"
        value={stats.currentStreak}
        icon={Flame}
        description="Consecutive days present"
        variant="warning"
      />
      <StatCard
        title="Days Present"
        value={stats.totalDaysPresent}
        icon={Clock}
        description="Total days you attended"
        variant="themedblue"
      />
    </div>
  );
};
