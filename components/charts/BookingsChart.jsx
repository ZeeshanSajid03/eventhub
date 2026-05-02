"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function BookingsChart({ events }) {
  const data = events.slice(0, 6).map((event) => ({
    name: event.title.length > 12
      ? event.title.substring(0, 12) + "..."
      : event.title,
    booked: event.ticketTypes.reduce((s, t) => s + t.bookedSeats, 0),
    available: event.ticketTypes.reduce(
      (s, t) => s + (t.totalSeats - t.bookedSeats), 0
    ),
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="booked" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Booked" />
        <Bar dataKey="available" fill="#e0e7ff" radius={[4, 4, 0, 0]} name="Available" />
      </BarChart>
    </ResponsiveContainer>
  );
}