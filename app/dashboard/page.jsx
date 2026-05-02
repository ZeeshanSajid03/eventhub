"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Spinner from "@/components/ui/Spinner";
import BookingsChart from "@/components/charts/BookingsChart";
import RevenueChart from "@/components/charts/RevenueChart";
import DailyBookingsChart from "@/components/charts/DailyBookingsChart";
import { DollarSign, CheckCircle, Ticket, BarChart2 } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const [eventsRes, statsRes] = await Promise.all([
        fetch("/api/events/mine"),
        fetch("/api/dashboard/stats"),
      ]);

      const eventsData = await eventsRes.json();
      const statsData = statsRes.ok ? await statsRes.json() : {};

      setEvents(eventsData.events || []);
      setBookings(statsData.bookings || []);
    } catch (err) {
      console.error(err);
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

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const totalRevenue = confirmedBookings.reduce(
    (sum, b) => sum + b.totalPrice, 0
  );
  const publishedEvents = events.filter((e) => e.status === "published").length;
  const pendingEvents = events.filter((e) => e.status === "pending").length;
  const totalSeats = events.reduce(
    (sum, e) => sum + e.ticketTypes.reduce((s, t) => s + t.totalSeats, 0), 0
  );
  const bookedSeats = events.reduce(
    (sum, e) => sum + e.ticketTypes.reduce((s, t) => s + t.bookedSeats, 0), 0
  );
  const occupancyRate = totalSeats > 0
    ? Math.round((bookedSeats / totalSeats) * 100)
    : 0;

  const statCards = [
    {
      label: "Total Revenue",
      value: `Rs. ${totalRevenue.toLocaleString()}`,
      icon: <DollarSign size={22} className="text-green-600" />,
      bg: "bg-green-50",
      sub: `${confirmedBookings.length} confirmed bookings`,
    },
    {
      label: "Published Events",
      value: publishedEvents,
      icon: <CheckCircle size={22} className="text-blue-600" />,
      bg: "bg-blue-50",
      sub: pendingEvents > 0 ? `${pendingEvents} pending review` : "All approved",
    },
    {
      label: "Total Bookings",
      value: totalBookings,
      icon: <Ticket size={22} className="text-purple-600" />,
      bg: "bg-purple-50",
      sub: `${bookedSeats} seats filled`,
    },
    {
      label: "Occupancy Rate",
      value: `${occupancyRate}%`,
      icon: <BarChart2 size={22} className="text-orange-600" />,
      bg: "bg-orange-50",
      sub: `${bookedSeats}/${totalSeats} seats`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {user?.name}
        </p>
      </div>

      {/* Pending notice */}
      {pendingEvents > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
          <p className="text-yellow-800 text-sm font-medium">
            {pendingEvents} event{pendingEvents !== 1 ? "s" : ""} waiting for admin approval
          </p>
          <Link
            href="/dashboard/events"
            className="text-yellow-700 text-sm hover:underline font-medium shrink-0 ml-4"
          >
            View →
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
          >
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            Bookings by Event
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Booked vs available seats per event
          </p>
          <BookingsChart events={events} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            Occupancy Rate
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Percentage of seats sold per event
          </p>
          <RevenueChart events={events} />
        </div>
      </div>

      {/* Daily bookings chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-1">
          Bookings Over Time
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Daily booking activity in the last 30 days
        </p>
        <DailyBookingsChart bookings={bookings} />
      </div>

      {/* Revenue per event table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">
            Revenue per Event
          </h2>
          <Link
            href="/dashboard/events"
            className="text-sm text-blue-600 hover:underline"
          >
            Manage events
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No events yet
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Event
                </th>
                <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                  Bookings
                </th>
                <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                  Occupancy
                </th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {events.map((event) => {
                const eventBookings = bookings.filter(
                  (b) =>
                    b.event?._id === event._id ||
                    b.event === event._id
                );
                const revenue = eventBookings
                  .filter((b) => b.status === "confirmed")
                  .reduce((sum, b) => sum + b.totalPrice, 0);
                const booked = event.ticketTypes.reduce(
                  (s, t) => s + t.bookedSeats, 0
                );
                const total = event.ticketTypes.reduce(
                  (s, t) => s + t.totalSeats, 0
                );
                const occ = total > 0
                  ? Math.round((booked / total) * 100)
                  : 0;

                return (
                  <tr key={event._id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <p className="font-medium text-gray-800 truncate max-w-xs">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-3 hidden sm:table-cell text-gray-600">
                      {booked}/{total}
                    </td>
                    <td className="py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 bg-gray-100 rounded-full w-16 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${occ >= 90
                                ? "bg-red-500"
                                : occ >= 60
                                  ? "bg-orange-400"
                                  : "bg-green-500"
                              }`}
                            style={{ width: `${occ}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{occ}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-semibold text-gray-800">
                      Rs. {revenue.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}