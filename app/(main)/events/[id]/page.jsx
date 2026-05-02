"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import TicketSelector from "@/components/TicketSelector";
import SeatCounter from "@/components/SeatCounter";
import toast from "react-hot-toast";
import EventCard from "@/components/EventCard";
import EventReviews from "@/components/EventReviews";
import { Calendar, MapPin, User, Share2, Tag } from "lucide-react";


const categoryColors = {
  concert: "purple",
  conference: "blue",
  sports: "green",
  festival: "yellow",
  workshop: "default",
  other: "default",
};

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedEvents, setRelatedEvents] = useState([]);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  async function fetchEvent() {
    try {
      setLoading(true);
      const res = await fetch(`/api/events/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setEvent(data.event);
      const relatedRes = await fetch(
        `/api/events?category=${data.event.category}`
      );
      const relatedData = await relatedRes.json();
      setRelatedEvents(
        relatedData.events
          .filter((e) => e._id !== id)
          .slice(0, 3)
      );
      // Pre-select first available ticket type
      const firstAvailable = data.event.ticketTypes.find(
        (t) => t.totalSeats - t.bookedSeats > 0
      );
      if (firstAvailable) setSelectedTicket(firstAvailable.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleBookNow() {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/events/${id}`);
      return;
    }
    // Save selection to sessionStorage and go to checkout
    sessionStorage.setItem(
      "checkoutData",
      JSON.stringify({ eventId: id, ticketType: selectedTicket, quantity })
    );
    router.push("/checkout");
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: event.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-500">{error}</div>
    );
  }

  if (!event) return null;

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

  const selectedTicketData = event.ticketTypes.find(
    (t) => t.name === selectedTicket
  );

  const totalPrice = selectedTicketData
    ? selectedTicketData.price * quantity
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* Left: Event info */}
        <div className="flex-1 min-w-0">
          {/* Cover image */}
          <div className="w-full h-72 rounded-2xl overflow-hidden bg-linear-to-br from-blue-400 to-indigo-600 mb-6">
            {event.image ? (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white text-8xl opacity-30">🎪</span>
              </div>
            )}
          </div>

          {/* Title + badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant={categoryColors[event.category] || "default"}>
              {event.category}
            </Badge>
            {event.isFeatured && <Badge variant="yellow">Featured</Badge>}
            {event.status === "cancelled" && (
              <Badge variant="red">Cancelled</Badge>
            )}
          </div>

          <div className="flex items-start justify-between gap-3 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {event.title}
            </h1>
            <button
              onClick={handleShare}
              className="shrink-0 p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition text-gray-500 hover:text-blue-600"
              title="Share event"
            >
              <Share2 size={18} />
            </button>
          </div>

          {/* Event meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Calendar size={22} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Date & Time
                </p>
                <p className="text-sm font-semibold text-gray-800">{formattedDate}</p>
                <p className="text-sm text-gray-600">{formattedTime}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <MapPin size={22} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Venue
                </p>
                <p className="text-sm font-semibold text-gray-800">{event.venue.name}</p>
                <p className="text-sm text-gray-600">
                  {event.venue.address}, {event.venue.city}
                </p>
              </div>
            </div>


            {event.organizer && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <User size={22} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Organizer
                  </p>
                  <a
                    href={`/organizer/${event.organizer._id}`}
                    className="text-sm font-semibold text-blue-600 hover:underline"
                  >
                    {event.organizer.name}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              About this event
            </h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Tags */}
          {event.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
          )}
          <EventReviews eventId={id} />
        </div>

        {/* Right: Booking panel */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 shadow-lg p-6 space-y-5">
            <h2 className="text-lg font-bold text-gray-900">
              Book Tickets
            </h2>

            {event.status === "cancelled" ? (
              <div className="p-4 bg-red-50 rounded-xl text-red-600 text-sm text-center">
                This event has been cancelled
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Overall capacity</span>
                    <span>
                      {event.ticketTypes.reduce((s, t) => s + t.bookedSeats, 0)} /
                      {event.ticketTypes.reduce((s, t) => s + t.totalSeats, 0)} booked
                    </span>
                  </div>
                  {(() => {
                    const totalBooked = event.ticketTypes.reduce((s, t) => s + t.bookedSeats, 0);
                    const totalSeats = event.ticketTypes.reduce((s, t) => s + t.totalSeats, 0);
                    const pct = totalSeats > 0 ? (totalBooked / totalSeats) * 100 : 0;
                    return (
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-orange-400" : "bg-green-500"
                            }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    );
                  })()}
                  {(() => {
                    const totalBooked = event.ticketTypes.reduce((s, t) => s + t.bookedSeats, 0);
                    const totalSeats = event.ticketTypes.reduce((s, t) => s + t.totalSeats, 0);
                    const pct = Math.round((totalBooked / totalSeats) * 100);
                    return (
                      <p className={`text-xs font-medium ${pct >= 90 ? "text-red-500" : pct >= 60 ? "text-orange-500" : "text-green-600"
                        }`}>
                        {pct >= 90 ? "Almost sold out!" : pct >= 60 ? `${pct}% sold` : `${pct}% sold`}
                      </p>
                    );
                  })()}
                </div>
                {/* Ticket types with real-time seat counts */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    Select Ticket Type
                  </p>
                  {event.ticketTypes.map((ticket) => {
                    const available = ticket.totalSeats - ticket.bookedSeats;
                    const isSelected = selectedTicket === ticket.name;
                    const isSoldOut = available === 0;

                    return (
                      <button
                        key={ticket.name}
                        onClick={() =>
                          !isSoldOut && setSelectedTicket(ticket.name)
                        }
                        disabled={isSoldOut}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${isSelected
                          ? "border-blue-500 bg-blue-50"
                          : isSoldOut
                            ? "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                            : "border-gray-200 hover:border-gray-300"
                          }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">
                              {ticket.name}
                            </p>
                            <SeatCounter
                              eventId={id}
                              ticketName={ticket.name}
                              initialAvailable={available}
                              initialTotal={ticket.totalSeats}
                            />
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600 text-sm">
                              {ticket.price === 0
                                ? "Free"
                                : `Rs. ${ticket.price.toLocaleString()}`}
                            </p>
                            {isSoldOut && (
                              <p className="text-xs text-red-500 mt-0.5">
                                Sold out
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Quantity selector */}
                {selectedTicket && (
                  <TicketSelector
                    quantity={quantity}
                    setQuantity={setQuantity}
                    max={
                      Math.min(
                        10,
                        (selectedTicketData?.totalSeats || 0) -
                        (selectedTicketData?.bookedSeats || 0)
                      )
                    }
                  />
                )}

                {/* Price summary */}
                {selectedTicket && (
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        {selectedTicket} x {quantity}
                      </span>
                      <span>
                        Rs. {(selectedTicketData?.price * quantity).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span>Rs. {totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <Button
                  fullWidth
                  onClick={handleBookNow}
                  disabled={!selectedTicket || event.status === "cancelled"}
                >
                  {isAuthenticated ? "Book Now" : "Login to Book"}
                </Button>

                <p className="text-xs text-gray-400 text-center">
                  Free cancellation up to 24 hours before the event
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      {
        relatedEvents.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              More {event.category?.charAt(0).toUpperCase() + event.category?.slice(1)} Events
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedEvents.map((e) => (
                <EventCard key={e._id} event={e} />
              ))}
            </div>
          </div>
        )
      }
    </div >
  );
}