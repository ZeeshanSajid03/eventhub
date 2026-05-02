import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import { requireAdmin } from "@/lib/apiAuth";

// POST /api/admin/events/:id/review - approve or reject
export async function POST(request, { params }) {
  try {
    const { error } = requireAdmin(request);
    if (error) return error;

    await connectDB();

    const { id } = await params;
    const { action, reason, featured } = await request.json();

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { message: "Action must be approve or reject" },
        { status: 400 }
      );
    }

    if (action === "reject" && !reason) {
      return NextResponse.json(
        { message: "Rejection reason is required" },
        { status: 400 }
      );
    }

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    event.status = action === "approve" ? "published" : "rejected";
    event.rejectionReason = action === "reject" ? reason : "";
    if (action === "approve") {
      event.isFeatured = featured || false;
    }
    await event.save();

    return NextResponse.json(
      {
        message: `Event ${action === "approve" ? "approved and published" : "rejected"} successfully`,
        event,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Review event error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}