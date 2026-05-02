import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import Event from "@/models/Event";
import { requireOrganizer } from "@/lib/apiAuth";

export async function GET(request) {
  try {
    const { error, user } = requireOrganizer(request);
    if (error) return error;

    await connectDB();

    const events = await Event.find({ organizer: user.userId }).lean();
    const eventIds = events.map((e) => e._id);

    const bookings = await Booking.find({ event: { $in: eventIds } })
      .populate("user", "name email")
      .populate("event", "title date")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error("Dashboard bookings error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}