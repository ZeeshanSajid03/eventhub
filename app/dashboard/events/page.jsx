"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";

const statusColors = {
  published: "green",
  pending: "yellow",
  draft: "default",
  rejected: "red",
  cancelled: "red",
  completed: "blue",
};

export default function ManageEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const res = await fetch("/api/events/mine");
      const data = await res.json();
      setEvents(data.events || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEvents(events.filter((e) => e._id !== id));
        setDeleteModal(null);
        toast.success("Event deleted successfully");
      } else {
        toast.error("Failed to delete event");
      }
    } finally {
      setDeleting(false);
    }
  }

  async function handleStatusChange(id, status) {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setEvents(events.map((e) => (e._id === id ? { ...e, status } : e)));
        toast.success(`Event ${status} successfully`);
      } else {
        toast.error("Failed to update event status");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
        <p className="text-gray-500 text-sm mt-1">
          {events.length} event{events.length !== 1 ? "s" : ""}
        </p>
        <div className="mt-4">
          <Link href="/dashboard/events/create">
            <Button>+ Create Event</Button>
          </Link>
        </div>
      </div>

      {loading && <SkeletonTable />}

      {!loading && events.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <EmptyState
            icon="🎪"
            title="No events yet"
            description="Create your first event to get started"
            action={
              <Link href="/dashboard/events/create">
                <Button>Create Event</Button>
              </Link>
            }
          />
        </div>
      )}

      {!loading && events.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Event
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                  Date
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                  Bookings
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {events.map((event) => {
                const booked = event.ticketTypes.reduce(
                  (s, t) => s + t.bookedSeats, 0
                );
                const total = event.ticketTypes.reduce(
                  (s, t) => s + t.totalSeats, 0
                );
                return (
                  <tr key={event._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800 truncate max-w-xs">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {event.category}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-gray-500 hidden sm:table-cell">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-gray-700 font-medium">
                        {booked}
                      </span>
                      <span className="text-gray-400">/{total}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <Badge variant={statusColors[event.status]}>
                          {event.status}
                        </Badge>
                        {event.status === "rejected" && event.rejectionReason && (
                          <p className="text-xs text-red-500 max-w-xs">
                            {event.rejectionReason}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {event.status === "draft" && (
                          <button
                            onClick={() => handleStatusChange(event._id, "published")}
                            className="text-xs text-green-600 hover:underline font-medium"
                          >
                            Publish
                          </button>
                        )}
                        {event.status === "published" && (
                          <button
                            onClick={() => handleStatusChange(event._id, "cancelled")}
                            className="text-xs text-orange-500 hover:underline font-medium"
                          >
                            Cancel
                          </button>
                        )}
                        <Link
                          href={`/dashboard/events/${event._id}`}
                          className="text-xs text-blue-600 hover:underline font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteModal(event._id)}
                          className="text-xs text-red-500 hover:underline font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Event"
      >
        <p className="text-gray-600 text-sm mb-5">
          Are you sure you want to delete this event? This action cannot be
          undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteModal(null)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={deleting}
            onClick={() => handleDelete(deleteModal)}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}