import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import { requireOrganizer } from "@/lib/apiAuth";

// GET /api/events - fetch all published events with filters
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const city = searchParams.get("city");
    const search = searchParams.get("search");
    const date = searchParams.get("date");
    const featured = searchParams.get("featured");

    // Build filter object
    const filter = { status: "published" };

    if (category) filter.category = category;
    if (city) filter["venue.city"] = { $regex: city, $options: "i" };
    if (featured) filter.isFeatured = true;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    } else {
      // By default only show upcoming events
      filter.date = { $gte: new Date() };
    }

    const events = await Event.find(filter)
      .populate("organizer", "name email")
      .sort({ date: 1 })
      .lean();

    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error("Get events error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/events - create a new event (organizer only)
export async function POST(request) {
  try {
    const { error, user } = requireOrganizer(request);
    if (error) return error;

    await connectDB();

    const body = await request.json();
    const {
      title,
      description,
      category,
      date,
      endDate,
      venue,
      image,
      ticketTypes,
      status,
      isFeatured,
      tags,
    } = body;

    // Basic validation
    if (!title || !description || !category || !date || !venue || !ticketTypes?.length) {
      return NextResponse.json(
        { message: "Please fill all required fields" },
        { status: 400 }
      );
    }

    const event = await Event.create({
      title,
      description,
      category,
      date,
      endDate,
      venue,
      image,
      ticketTypes,
      status: "pending",
      isFeatured: isFeatured || false,
      tags: tags || [],
      organizer: user.userId,
    });

    return NextResponse.json(
      { message: "Event created successfully", event },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}