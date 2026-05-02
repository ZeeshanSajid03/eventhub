import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import { requireOrganizer } from "@/lib/apiAuth";

// GET /api/events/:id - get single event
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const event = await Event.findById(id)
      .populate("organizer", "name email")
      .lean();

    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    console.error("Get event error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/events/:id - update event (organizer only)
export async function PUT(request, { params }) {
  try {
    const { error, user } = requireOrganizer(request);
    if (error) return error;

    await connectDB();

    const { id } = await params;
    const body = await request.json();

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    // Make sure only the organizer who created it can edit it
    if (
      event.organizer.toString() !== user.userId &&
      user.role !== "admin"
    ) {
      return NextResponse.json(
        { message: "You are not authorized to edit this event" },
        { status: 403 }
      );
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { ...body },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { message: "Event updated successfully", event: updatedEvent },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update event error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/:id - delete event (organizer only)
export async function DELETE(request, { params }) {
  try {
    const { error, user } = requireOrganizer(request);
    if (error) return error;

    await connectDB();

    const { id } = await params;
    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    if (
      event.organizer.toString() !== user.userId &&
      user.role !== "admin"
    ) {
      return NextResponse.json(
        { message: "You are not authorized to delete this event" },
        { status: 403 }
      );
    }

    await Event.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Event deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}