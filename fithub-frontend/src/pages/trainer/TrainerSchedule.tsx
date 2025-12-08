import { useEffect, useState } from "react";

interface Session {
  id: number;
  clientName: string;
  time: string;
  type: string;
}

export default function TrainerSchedule() {
  const [todaySessions, setTodaySessions] = useState<Session[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate upcoming dynamic API
    setTimeout(() => {
      setTodaySessions([
        { id: 1, clientName: "Rohit Sharma", time: "8:00 AM - 9:00 AM", type: "Strength Training" },
        { id: 2, clientName: "Neha Verma", time: "10:00 AM - 11:00 AM", type: "Cardio" },
      ]);

      setUpcomingSessions([
        { id: 3, clientName: "Amit Patel", time: "Tomorrow · 7:00 AM", type: "Yoga" },
        { id: 4, clientName: "Priya Gupta", time: "Tomorrow · 4:00 PM", type: "Weight Loss Plan" },
        { id: 5, clientName: "Rahul Singh", time: "Sunday · 9:30 AM", type: "HIIT" },
      ]);

      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return <p className="text-gray-600 mt-6">Loading schedule...</p>;
  }

  return (
    <div className="pb-20">
      <h1 className="text-3xl font-bold mb-6">Trainer Schedule</h1>

      {/* Today Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-10">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Today's Sessions</h2>

        {todaySessions.length === 0 ? (
          <p className="text-gray-500">No sessions scheduled for today.</p>
        ) : (
          <div className="space-y-4">
            {todaySessions.map((session) => (
              <div
                key={session.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <p className="text-lg font-semibold">{session.clientName}</p>
                <p className="text-gray-600">{session.time}</p>
                <p className="text-blue-600 font-medium">{session.type}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Upcoming Sessions
        </h2>

        {upcomingSessions.length === 0 ? (
          <p className="text-gray-500">No upcoming sessions.</p>
        ) : (
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <div
                key={session.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <p className="text-lg font-semibold">{session.clientName}</p>
                <p className="text-gray-600">{session.time}</p>
                <p className="text-blue-600 font-medium">{session.type}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
