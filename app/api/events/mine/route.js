import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import { requireOrganizer } from "@/lib/apiAuth";

export async function GET(request) {
  try {
    const { error, user } = requireOrganizer(request);
    if (error) return error;

    await connectDB();

    const events = await Event.find({ organizer: user.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error("Get my events error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}