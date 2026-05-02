import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Waitlist from "@/models/Waitlist";
import Event from "@/models/Event";
import { requireAuth } from "@/lib/apiAuth";

// POST /api/waitlist - join waitlist
export async function POST(request) {
  try {
    const { error, user } = requireAuth(request);
    if (error) return error;

    await connectDB();

    const { eventId, ticketType } = await request.json();

    if (!eventId || !ticketType) {
      return NextResponse.json(
        { message: "eventId and ticketType are required" },
        { status: 400 }
      );
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    // Check if already on waitlist
    const existing = await Waitlist.findOne({
      user: user.userId,
      event: eventId,
      ticketType,
    });

    if (existing) {
      return NextResponse.json(
        { message: "You are already on the waitlist for this ticket" },
        { status: 409 }
      );
    }

    const entry = await Waitlist.create({
      user: user.userId,
      event: eventId,
      ticketType,
    });

    return NextResponse.json(
      { message: "Added to waitlist successfully", entry },
      { status: 201 }
    );
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/waitlist - check if user is on waitlist for an event
export async function GET(request) {
  try {
    const { error, user } = requireAuth(request);
    if (error) return error;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const ticketType = searchParams.get("ticketType");

    const entry = await Waitlist.findOne({
      user: user.userId,
      event: eventId,
      ticketType,
    });

    return NextResponse.json({ onWaitlist: !!entry }, { status: 200 });
  } catch (error) {
    console.error("Waitlist check error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}