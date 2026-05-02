"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DailyBookingsChart({ bookings }) {
  // Build last 30 days data
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    days.push({
      date,
      label: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      bookings: 0,
      revenue: 0,
    });
  }

  // Count bookings per day
  bookings.forEach((booking) => {
    const bookingDate = new Date(booking.createdAt);
    bookingDate.setHours(0, 0, 0, 0);
    const day = days.find(
      (d) => d.date.toDateString() === bookingDate.toDateString()
    );
    if (day) {
      day.bookings += 1;
      if (booking.status === "confirmed") {
        day.revenue += booking.totalPrice;
      }
    }
  });

  // Only show every 5th label to avoid crowding
  const data = days.map((d, i) => ({
    ...d,
    displayLabel: i % 5 === 0 ? d.label : "",
  }));

  if (bookings.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No booking data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="displayLabel"
          tick={{ fontSize: 11 }}
          interval={0}
        />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip
          formatter={(value, name) => [
            name === "bookings" ? value : `Rs. ${value.toLocaleString()}`,
            name === "bookings" ? "Bookings" : "Revenue",
          ]}
          labelFormatter={(label) => label}
        />
        <Line
          type="monotone"
          dataKey="bookings"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          name="bookings"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}