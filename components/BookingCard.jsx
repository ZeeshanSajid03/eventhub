"use client";

import { useState } from "react";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import Modal from "./ui/Modal";
import QRTicket from "./QRTicket";
import toast from "react-hot-toast";
import { Calendar, MapPin, Ticket, Printer } from "lucide-react";

export default function BookingCard({ booking, onCancel }) {
  const [qrModal, setQrModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const event = booking.event;
  const isPast = new Date(event.date) < new Date();
  const isCancelled = booking.status === "cancelled";
  const canCancel =
    !isCancelled &&
    !isPast &&
    new Date() < new Date(booking.cancellationDeadline);

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${booking._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCancelModal(false);
        onCancel(booking._id);
        toast.success("Booking cancelled successfully");
      } else {
        const data = await res.json();
        toast.error(data.message || "Cancellation failed");
      }
    } finally {
      setCancelling(false);
    }
  }

  return (
    <>
      <div
        className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition ${isCancelled ? "opacity-60 border-gray-100" : "border-gray-100 hover:shadow-md"
          }`}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Event image */}
          <div className="w-full sm:w-40 h-32 sm:h-auto bg-linear-to-br from-blue-400 to-indigo-600 shrink-0 relative">
            {event.image && (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            )}
            {isCancelled && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-xs font-bold tracking-wider">
                  CANCELLED
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {event.title}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {event.venue?.name}, {event.venue?.city}
                </p>
              </div>
              <Badge variant={isCancelled ? "red" : isPast ? "default" : "green"}>
                {isCancelled ? "Cancelled" : isPast ? "Past" : "Confirmed"}
              </Badge>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-gray-400" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Ticket size={13} className="text-gray-400" />
                {booking.ticketType} x {booking.quantity}
              </span>
              <span className="font-semibold text-blue-600">
                Rs. {booking.totalPrice?.toLocaleString()}
              </span>
            </div>


            <div className="mt-4 flex gap-2">
              {!isCancelled && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setQrModal(true)}
                >
                  View Ticket
                </Button>
              )}
              {canCancel && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setCancelModal(true)}
                >
                  Cancel
                </Button>
              )}
              {!canCancel && !isCancelled && !isPast && (
                <p className="text-xs text-orange-500 self-center">
                  Cancellation deadline passed
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QR Ticket Modal */}
      <Modal
        isOpen={qrModal}
        onClose={() => setQrModal(false)}
        title="Your Ticket"
      >
        <div className="flex flex-col items-center gap-4">
          <QRTicket booking={booking} />
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <Printer size={16} />
            Print Ticket
          </button>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModal}
        onClose={() => setCancelModal(false)}
        title="Cancel Booking"
      >
        <p className="text-gray-600 text-sm mb-5">
          Are you sure you want to cancel this booking? The seats will be
          released back.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCancelModal(false)}
          >
            Keep Booking
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={cancelling}
            onClick={handleCancel}
          >
            Cancel Booking
          </Button>
        </div>
      </Modal>
    </>
  );
}