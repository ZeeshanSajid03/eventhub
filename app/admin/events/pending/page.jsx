"use client";

import { useState, useEffect } from "react";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import toast from "react-hot-toast";

export default function PendingEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [action, setAction] = useState("approve");
  const [reason, setReason] = useState("");
  const [featured, setFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPending();
  }, []);

  async function fetchPending() {
    try {
      const res = await fetch("/api/admin/events?status=pending");
      const data = await res.json();
      setEvents(data.events || []);
    } finally {
      setLoading(false);
    }
  }

 async function handleReview() {
  if (action === "reject" && !reason.trim()) {
    setError("Please provide a rejection reason");
    return;
  }

  setSubmitting(true);
  setError("");

  try {
    const res = await fetch(
      `/api/admin/events/${reviewModal._id}/review`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason, featured }),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setEvents((prev) => prev.filter((e) => e._id !== reviewModal._id));
    setReviewModal(null);
    setReason("");
    setAction("approve");
    setFeatured(false);
    toast.success(
      action === "approve"
        ? "Event approved and published!"
        : "Event rejected"
    );
  } catch (err) {
    setError(err.message);
    toast.error(err.message);
  } finally {
    setSubmitting(false);
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
        <h1 className="text-2xl font-bold text-gray-900">Pending Events</h1>
        <p className="text-gray-500 text-sm mt-1">
          {events.length} event{events.length !== 1 ? "s" : ""} waiting for review
        </p>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-4xl mb-3">✅</p>
          <h3 className="text-lg font-semibold text-gray-700">
            All caught up!
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            No events pending review
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Image */}
                <div className="w-full sm:w-32 h-24 rounded-xl overflow-hidden bg-linear-to-br from-blue-400 to-indigo-600 shrink-0">
                  {event.image && (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {event.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        By {event.organizer?.name} ({event.organizer?.email})
                      </p>
                    </div>
                    <Badge variant="yellow">Pending</Badge>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                    <span>📍 {event.venue?.name}, {event.venue?.city}</span>
                    <span className="capitalize">🏷️ {event.category}</span>
                  </div>

                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setReviewModal(event);
                        setAction("approve");
                        setReason("");
                        setFeatured(false);
                        setError("");
                      }}
                    >
                      Review
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        window.open(`/events/${event._id}`, "_blank")
                      }
                    >
                      Preview
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={!!reviewModal}
        onClose={() => setReviewModal(null)}
        title={`Review: ${reviewModal?.title}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Choose an action for this event submission.
          </p>

          {/* Action toggle */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setAction("approve")}
              className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${action === "approve"
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
            >
              ✅ Approve
            </button>
            <button
              onClick={() => setAction("reject")}
              className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${action === "reject"
                ? "border-red-500 bg-red-50 text-red-700"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
            >
              ❌ Reject
            </button>
          </div>

          {/* Rejection reason */}
          {action === "approve" && (
            <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <input
                type="checkbox"
                id="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-yellow-500"
              />
              <label htmlFor="featured" className="text-sm font-medium text-yellow-800">
                Mark as Featured Event
              </label>
            </div>
          )}

          {action === "reject" && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Tell the organizer why their event was rejected..."
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none"
              />
            </div>
          )}

          {action === "approve" && (
            <div className="bg-green-50 rounded-xl p-3 text-sm text-green-700">
              This event will be published and visible to all users immediately.
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex gap-3 justify-end pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReviewModal(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant={action === "approve" ? "primary" : "danger"}
              loading={submitting}
              onClick={handleReview}
            >
              {action === "approve" ? "Approve Event" : "Reject Event"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}