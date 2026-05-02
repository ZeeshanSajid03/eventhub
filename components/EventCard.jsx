"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Badge from "./ui/Badge";
import { Calendar, MapPin, Clock } from "lucide-react";

const categoryColors = {
  concert: "purple",
  conference: "blue",
  sports: "green",
  festival: "yellow",
  workshop: "default",
  other: "default",
};

function getCountdown(date) {
  const diff = new Date(date) - new Date();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 30) return null;
  if (days > 0) return `${days}d ${hours}h left`;
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

export default function EventCard({ event }) {
  const [countdown, setCountdown] = useState(() => getCountdown(event.date));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown(event.date));
    }, 60000);
    return () => clearInterval(timer);
  }, [event.date]);

  const availableSeats = event.ticketTypes?.reduce(
    (sum, t) => sum + (t.totalSeats - t.bookedSeats), 0
  );
  const lowestPrice = event.ticketTypes?.reduce(
    (min, t) => (t.price < min ? t.price : min),
    Infinity
  );
  const isSoldOut = availableSeats === 0;

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href={`/events/${event._id}`}>
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 bg-linear-to-br from-blue-400 to-indigo-600 overflow-hidden">
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Calendar size={48} className="text-white opacity-30" />
            </div>
          )}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg tracking-wider">
                SOLD OUT
              </span>
            </div>
          )}
          {event.isFeatured && (
            <div className="absolute top-3 left-3">
              <Badge variant="yellow">Featured</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge variant={categoryColors[event.category] || "default"}>
              {event.category?.charAt(0).toUpperCase() + event.category?.slice(1)}
            </Badge>
            {!isSoldOut && (
              <span className="text-xs text-gray-400">
                {availableSeats} seats left
              </span>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-2">
            {event.title}
          </h3>

          <p className="text-sm text-gray-500 mb-3 line-clamp-2 flex-1">
            {event.description}
          </p>

          <div className="space-y-1.5 mt-auto">
            {countdown && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-orange-500">
                <Clock size={12} />
                <span>{countdown}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar size={12} />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin size={12} />
              <span>{event.venue?.name}, {event.venue?.city}</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-blue-600">
              {lowestPrice === 0
                ? "Free"
                : `From Rs. ${lowestPrice?.toLocaleString()}`}
            </span>
            <span className="text-xs text-blue-600 font-medium">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}