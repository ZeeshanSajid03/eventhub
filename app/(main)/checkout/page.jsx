"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import { Calendar, MapPin } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [checkoutData, setCheckoutData] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [bookedData, setBookedData] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("checkoutData");
    if (!stored) {
      router.push("/events");
      return;
    }
    const parsed = JSON.parse(stored);
    setCheckoutData(parsed);
    fetchEvent(parsed.eventId);
  }, []);

  async function fetchEvent(eventId) {
    try {
      const res = await fetch(`/api/events/${eventId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setEvent(data.event);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmBooking() {
    setBooking(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: checkoutData.eventId,
          ticketType: checkoutData.ticketType,
          quantity: checkoutData.quantity,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      sessionStorage.removeItem("checkoutData");
      setBookedData(data.booking);
      setSuccess(true);
      toast.success("Booking confirmed!");

      await fetch("/api/email/booking-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: data.booking._id }),
      });
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setBooking(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (success && bookedData) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Your tickets have been booked successfully. Check your email for
            confirmation.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Event</span>
              <span className="font-medium text-gray-800">{event?.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ticket</span>
              <span className="font-medium text-gray-800">
                {checkoutData?.ticketType}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Quantity</span>
              <span className="font-medium text-gray-800">
                {checkoutData?.quantity}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="font-semibold text-gray-700">Total Paid</span>
              <span className="font-bold text-blue-600">
                Rs. {bookedData.totalPrice?.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => router.push("/events")}
            >
              Browse Events
            </Button>
            <Button fullWidth onClick={() => router.push("/bookings")}>
              My Bookings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!event || !checkoutData) return null;

  const ticketData = event.ticketTypes.find(
    (t) => t.name === checkoutData.ticketType
  );
  const totalPrice = ticketData ? ticketData.price * checkoutData.quantity : 0;

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = new Date(event.date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Confirm Booking</h1>
        <p className="text-gray-500 text-sm mt-1">
          Review your order before confirming
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-40 bg-linear-to-br from-blue-400 to-indigo-600 relative">
            {event.image && (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              {event.title}
            </h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={15} className="text-gray-400" />
                <span>{formattedDate} at {formattedTime}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={15} className="text-gray-400" />
                <span>{event.venue.name}, {event.venue.city}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ticket Type</span>
              <span className="font-medium">{checkoutData.ticketType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Price per ticket</span>
              <span className="font-medium">
                Rs. {ticketData?.price.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Quantity</span>
              <span className="font-medium">{checkoutData.quantity}</span>
            </div>
            <div className="flex justify-between text-sm pt-3 border-t border-gray-100">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-blue-600 text-base">
                Rs. {totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Booking For</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
          <span className="font-medium">Cancellation Policy:</span> Free
          cancellation up to 24 hours before the event starts.
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" fullWidth onClick={() => router.back()}>
            Go Back
          </Button>
          <Button fullWidth loading={booking} onClick={handleConfirmBooking}>
            Confirm Booking
          </Button>
        </div>
      </div>
    </div>
  );
}