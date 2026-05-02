"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd"];

export default function RevenueChart({ events }) {
  const data = events
    .slice(0, 5)
    .map((event) => {
      const booked = event.ticketTypes.reduce((s, t) => s + t.bookedSeats, 0);
      const total = event.ticketTypes.reduce((s, t) => s + t.totalSeats, 0);
      return {
        name: event.title.length > 14
          ? event.title.substring(0, 14) + "..."
          : event.title,
        value: total > 0 ? Math.round((booked / total) * 100) : 0,
      };
    })
    .filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value}% sold`} />
        <Legend iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}