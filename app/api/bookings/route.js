import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import Event from "@/models/Event";
import { requireAuth } from "@/lib/apiAuth";

// POST /api/bookings - create a new booking
export async function POST(request) {
  try {
    const { error, user } = requireAuth(request);
    if (error) return error;

    await connectDB();

    const { eventId, ticketType, quantity } = await request.json();

    if (!eventId || !ticketType || !quantity) {
      return NextResponse.json(
        { message: "eventId, ticketType and quantity are required" },
        { status: 400 }
      );
    }

    if (quantity < 1 || quantity > 10) {
      return NextResponse.json(
        { message: "Quantity must be between 1 and 10" },
        { status: 400 }
      );
    }

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    // Check if user already has an active booking for this event
    const existingBooking = await Booking.findOne({
      user: user.userId,
      event: eventId,
      status: "confirmed",
    });

    if (existingBooking) {
      return NextResponse.json(
        { message: "You already have an active booking for this event. Go to My Bookings to manage it." },
        { status: 400 }
      );
    }

    if (event.status !== "published") {
      return NextResponse.json(
        { message: "This event is not available for booking" },
        { status: 400 }
      );
    }

    // Find the ticket type inside the event
    const ticketIndex = event.ticketTypes.findIndex(
      (t) => t.name === ticketType
    );

    if (ticketIndex === -1) {
      return NextResponse.json(
        { message: "Ticket type not found" },
        { status: 404 }
      );
    }

    const ticket = event.ticketTypes[ticketIndex];
    const availableSeats = ticket.totalSeats - ticket.bookedSeats;

    if (availableSeats < quantity) {
      return NextResponse.json(
        {
          message:
            availableSeats === 0
              ? "This ticket type is sold out"
              : `Only ${availableSeats} seats available`,
        },
        { status: 400 }
      );
    }

    const totalPrice = ticket.price * quantity;

    // Calculate cancellation deadline (24 hours before event)
    const cancellationDeadline = new Date(event.date);
    cancellationDeadline.setHours(cancellationDeadline.getHours() - 24);

    // Atomically increment bookedSeats to prevent overbooking
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        [`ticketTypes.${ticketIndex}.bookedSeats`]: ticket.bookedSeats,
      },
      {
        $inc: { [`ticketTypes.${ticketIndex}.bookedSeats`]: quantity },
      },
      { new: true }
    );

    // If updatedEvent is null it means another booking changed the seats
    // between our check and update (race condition), so we reject
    if (!updatedEvent) {
      return NextResponse.json(
        { message: "Booking failed due to a conflict, please try again" },
        { status: 409 }
      );
    }

    // Create booking
    const booking = await Booking.create({
      user: user.userId,
      event: eventId,
      ticketType,
      quantity,
      totalPrice,
      cancellationDeadline,
      qrCode: `EVENTHUB-${eventId}-${user.userId}-${Date.now()}`,
    });

    // Populate event details for response
    await booking.populate("event", "title date venue image");

    return NextResponse.json(
      { message: "Booking confirmed", booking },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}