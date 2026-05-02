"use client";

import { useState, useEffect } from "react";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";

const statusColors = {
  published: "green",
  pending: "yellow",
  rejected: "red",
  cancelled: "red",
  completed: "blue",
  draft: "default",
};

export default function AdminAllEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const res = await fetch("/api/admin/events");
      const data = await res.json();
      setEvents(data.events || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleFeatureToggle(id, currentFeatured) {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/events/${id}/feature`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setEvents((prev) =>
        prev.map((e) =>
          e._id === id ? { ...e, isFeatured: data.isFeatured } : e
        )
      );
      toast.success(data.message);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setTogglingId(null);
    }
  }

  const filtered =
    filter === "all" ? events : events.filter((e) => e.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">All Events</h1>

      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "published", "rejected", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
              filter === f
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Event
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                Organizer
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                Date
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Status
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                Featured
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((event) => (
              <tr key={event._id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-800 truncate max-w-xs">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {event.category}
                  </p>
                </td>
                <td className="px-5 py-4 hidden sm:table-cell">
                  <p className="text-gray-700">{event.organizer?.name}</p>
                  <p className="text-xs text-gray-400">
                    {event.organizer?.email}
                  </p>
                </td>
                <td className="px-5 py-4 text-gray-500 hidden md:table-cell">
                  {new Date(event.date).toLocaleDateString()}
                </td>
                <td className="px-5 py-4">
                  <Badge variant={statusColors[event.status]}>
                    {event.status}
                  </Badge>
                </td>
                <td className="px-5 py-4 hidden lg:table-cell">
                  {event.status === "published" ? (
                    <button
                      onClick={() =>
                        handleFeatureToggle(event._id, event.isFeatured)
                      }
                      disabled={togglingId === event._id}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        event.isFeatured
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {togglingId === event._id
                        ? "..."
                        : event.isFeatured
                        ? "⭐ Featured"
                        : "Not Featured"}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-300">N/A</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end">
                    <a
                      href={`/events/${event._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      View
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            No events found
          </div>
        )}
      </div>
    </div>
  );
}