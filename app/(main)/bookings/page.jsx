"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BookingCard from "@/components/BookingCard";
import { SkeletonBookingCard } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const res = await fetch("/api/user/bookings");
      const data = await res.json();
      setBookings(data.bookings || []);
    } finally {
      setLoading(false);
    }
  }

  function handleCancel(bookingId) {
    setBookings((prev) =>
      prev.map((b) =>
        b._id === bookingId ? { ...b, status: "cancelled" } : b
      )
    );
  }

  const filtered = bookings.filter((b) => {
    if (filter === "confirmed") return b.status === "confirmed";
    if (filter === "cancelled") return b.status === "cancelled";
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-500 mt-1">
          {bookings.length} booking{bookings.length !== 1 ? "s" : ""} total
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {["all", "confirmed", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <SkeletonBookingCard key={i} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && filter === "all" && (
        <EmptyState
          icon="🎟️"
          title="No bookings yet"
          description="Browse events and book your first ticket"
          action={
            <Link
              href="/events"
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Browse Events
            </Link>
          }
        />
      )}

      {!loading && filtered.length === 0 && filter !== "all" && (
        <EmptyState
          icon="🎟️"
          title={`No ${filter} bookings`}
          description="Try a different filter"
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}