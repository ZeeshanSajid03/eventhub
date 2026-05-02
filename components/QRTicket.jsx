"use client";

import { QRCodeSVG } from "qrcode.react";
import { Calendar, MapPin, Ticket, Users } from "lucide-react";


export default function QRTicket({ booking }) {
  const event = booking.event;

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = new Date(event.date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="qr-ticket bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm max-w-sm w-full">

      {/* Ticket header */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-5 text-white">
        <p className="text-xs font-medium uppercase tracking-wider opacity-80 mb-1">
          EventHub Ticket
        </p>
        <h3 className="text-lg font-bold leading-tight">{event.title}</h3>
      </div>

      {/* Ticket body */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center gap-1 text-gray-400 mb-0.5">
              <Calendar size={10} />
              <p className="text-xs uppercase tracking-wide">Date</p>
            </div>
            <p className="text-sm font-semibold text-gray-800">{formattedDate}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-gray-400 mb-0.5">
              <Calendar size={10} />
              <p className="text-xs uppercase tracking-wide">Time</p>
            </div>
            <p className="text-sm font-semibold text-gray-800">{formattedTime}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-gray-400 mb-0.5">
              <MapPin size={10} />
              <p className="text-xs uppercase tracking-wide">Venue</p>
            </div>
            <p className="text-sm font-semibold text-gray-800">{event.venue?.name}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-gray-400 mb-0.5">
              <Ticket size={10} />
              <p className="text-xs uppercase tracking-wide">Ticket</p>
            </div>
            <p className="text-sm font-semibold text-gray-800">{booking.ticketType}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-gray-400 mb-0.5">
              <Users size={10} />
              <p className="text-xs uppercase tracking-wide">Quantity</p>
            </div>
            <p className="text-sm font-semibold text-gray-800">{booking.quantity}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              Total
            </p>
            <p className="text-sm font-semibold text-blue-600">
              Rs. {booking.totalPrice?.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Dashed separator */}
        <div className="border-t-2 border-dashed border-gray-200" />

        {/* QR Code */}
        <div className="flex flex-col items-center gap-2">
          <QRCodeSVG
            value={booking.qrCode || booking._id}
            size={120}
            bgColor="#ffffff"
            fgColor="#1e293b"
            level="M"
          />
          <p className="text-xs text-gray-400 text-center">
            Show this QR code at the venue
          </p>
          <p className="text-xs text-gray-300 font-mono">
            {booking.qrCode?.substring(0, 24)}...
          </p>
        </div>
      </div>
    </div>
  );
}