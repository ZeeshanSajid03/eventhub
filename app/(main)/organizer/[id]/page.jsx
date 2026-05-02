"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import EventCard from "@/components/EventCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

export default function OrganizerProfilePage() {
  const { id } = useParams();
  const [organizer, setOrganizer] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrganizer();
  }, [id]);

  async function fetchOrganizer() {
    try {
      const res = await fetch(`/api/organizers/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrganizer(data.organizer);
      setEvents(data.events);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  const upcomingEvents = events.filter((e) => new Date(e.date) >= new Date());
  const pastEvents = events.filter((e) => new Date(e.date) < new Date());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Organizer header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        {loading ? (
          <div className="flex items-center gap-5 animate-pulse">
            <div className="w-20 h-20 rounded-full bg-gray-200" />
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center shrink-0">
              {organizer?.avatar ? (
                <img
                  src={organizer.avatar}
                  alt={organizer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-blue-600 font-bold text-3xl">
                  {organizer?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {organizer?.name}
                </h1>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  Verified Organizer
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-1">
                Member since{" "}
                {new Date(organizer?.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <div className="flex gap-4 mt-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {events.length}
                  </p>
                  <p className="text-xs text-gray-400">Total Events</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {upcomingEvents.length}
                  </p>
                  <p className="text-xs text-gray-400">Upcoming</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {pastEvents.length}
                  </p>
                  <p className="text-xs text-gray-400">Past Events</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          Upcoming Events
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <EmptyState
            icon="🎪"
            title="No upcoming events"
            description="This organizer has no upcoming events scheduled"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Past Events */}
      {!loading && pastEvents.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            Past Events
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 opacity-75">
            {pastEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}