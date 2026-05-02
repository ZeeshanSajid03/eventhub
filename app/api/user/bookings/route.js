import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import { requireAuth } from "@/lib/apiAuth";

// GET /api/user/bookings - get all bookings for logged in user
export async function GET(request) {
  try {
    const { error, user } = requireAuth(request);
    if (error) return error;

    await connectDB();

    const bookings = await Booking.find({ user: user.userId })
      .populate("event", "title date venue image category status")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error("Get user bookings error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}