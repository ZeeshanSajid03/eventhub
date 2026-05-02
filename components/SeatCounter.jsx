"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";

export default function SeatCounter({
  eventId,
  ticketName,
  initialAvailable,
  initialTotal,
}) {
  const [available, setAvailable] = useState(initialAvailable);
  const socketRef = useSocket();

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // Join the event's room to receive real-time updates
    socket.emit("join-event", eventId);

    // Listen for seat updates
    socket.on("seats-updated", (data) => {
      if (data.eventId === eventId && data.ticketName === ticketName) {
        setAvailable(data.available);
      }
    });

    return () => {
      socket.off("seats-updated");
    };
  }, [eventId, ticketName]);

  const percentage = (available / initialTotal) * 100;
  const isLow = available <= 10 && available > 0;
  const isSoldOut = available === 0;

  return (
    <div className="mt-1">
      <p
        className={`text-xs ${
          isSoldOut
            ? "text-red-500"
            : isLow
            ? "text-orange-500"
            : "text-gray-500"
        }`}
      >
        {isSoldOut
          ? "Sold out"
          : isLow
          ? `Only ${available} left!`
          : `${available} available`}
      </p>
      {/* Seat availability bar */}
      <div className="mt-1 h-1 bg-gray-200 rounded-full w-24 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isSoldOut
              ? "bg-red-400"
              : isLow
              ? "bg-orange-400"
              : "bg-green-400"
          }`}
          style={{ width: `${Math.max(percentage, 0)}%` }}
        />
      </div>
    </div>
  );
}