import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import Event from "@/models/Event";
import { requireAuth } from "@/lib/apiAuth";

// GET /api/bookings/:id - get single booking
export async function GET(request, { params }) {
  try {
    const { error, user } = requireAuth(request);
    if (error) return error;

    await connectDB();

    const { id } = await params;
    const booking = await Booking.findById(id)
      .populate("event", "title date venue image category")
      .populate("user", "name email");

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    // Only the booking owner or organizer/admin can view it
    if (
      booking.user._id.toString() !== user.userId &&
      user.role !== "organizer" &&
      user.role !== "admin"
    ) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({ booking }, { status: 200 });
  } catch (error) {
    console.error("Get booking error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/:id - cancel booking
export async function DELETE(request, { params }) {
  try {
    const { error, user } = requireAuth(request);
    if (error) return error;

    await connectDB();

    const { id } = await params;
    const booking = await Booking.findById(id).populate("event");

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    // Only booking owner can cancel
    if (booking.user.toString() !== user.userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    if (booking.status === "cancelled") {
      return NextResponse.json(
        { message: "Booking is already cancelled" },
        { status: 400 }
      );
    }

    // Check cancellation deadline
    if (new Date() > booking.cancellationDeadline) {
      return NextResponse.json(
        {
          message:
            "Cancellation deadline has passed (24 hours before event)",
        },
        { status: 400 }
      );
    }

    // Find ticket index to release seats back
    const event = await Event.findById(booking.event._id);
    const ticketIndex = event.ticketTypes.findIndex(
      (t) => t.name === booking.ticketType
    );

    if (ticketIndex !== -1) {
      // Release the seats back
      await Event.findByIdAndUpdate(booking.event._id, {
        $inc: {
          [`ticketTypes.${ticketIndex}.bookedSeats`]: -booking.quantity,
        },
      });
    }

    // Mark booking as cancelled
    booking.status = "cancelled";
    await booking.save();

    return NextResponse.json(
      { message: "Booking cancelled successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}