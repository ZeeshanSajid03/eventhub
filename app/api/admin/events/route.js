import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import { requireAdmin } from "@/lib/apiAuth";

// GET all events for admin (all statuses)
export async function GET(request) {
  try {
    const { error } = requireAdmin(request);
    if (error) return error;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const filter = status ? { status } : {};

    const events = await Event.find(filter)
      .populate("organizer", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error("Admin get events error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}