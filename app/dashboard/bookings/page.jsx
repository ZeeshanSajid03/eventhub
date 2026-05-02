"use client";

import { useState, useEffect } from "react";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";

export default function OrganizerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const res = await fetch("/api/dashboard/bookings");
      const data = await res.json();
      setBookings(data.bookings || []);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
        <p className="text-gray-500 text-sm mt-1">
          {bookings.length} booking{bookings.length !== 1 ? "s" : ""} across
          all your events
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-4xl mb-3">🎟️</p>
          <h3 className="text-lg font-semibold text-gray-700">
            No bookings yet
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Bookings will appear here once people start booking your events
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Customer
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                  Event
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                  Ticket
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Total
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800">
                      {booking.user?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {booking.user?.email}
                    </p>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <p className="text-gray-700 truncate max-w-xs">
                      {booking.event?.title}
                    </p>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-gray-500">
                    {booking.ticketType} x {booking.quantity}
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-800">
                    Rs. {booking.totalPrice?.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      variant={
                        booking.status === "confirmed" ? "green" : "red"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}