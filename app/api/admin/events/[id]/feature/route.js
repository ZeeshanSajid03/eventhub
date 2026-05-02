import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import { requireAdmin } from "@/lib/apiAuth";

export async function POST(request, { params }) {
  try {
    const { error } = requireAdmin(request);
    if (error) return error;

    await connectDB();

    const { id } = await params;
    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    event.isFeatured = !event.isFeatured;
    await event.save();

    return NextResponse.json(
      {
        message: event.isFeatured
          ? "Event marked as featured"
          : "Event removed from featured",
        isFeatured: event.isFeatured,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Feature toggle error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}