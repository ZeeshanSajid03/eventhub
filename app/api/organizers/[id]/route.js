import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Event from "@/models/Event";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const organizer = await User.findById(id).select("name email avatar role createdAt");
    if (!organizer || (organizer.role !== "organizer" && organizer.role !== "admin")) {
      return NextResponse.json({ message: "Organizer not found" }, { status: 404 });
    }

    const events = await Event.find({
      organizer: id,
      status: "published",
    })
      .sort({ date: 1 })
      .lean();

    return NextResponse.json({ organizer, events }, { status: 200 });
  } catch (error) {
    console.error("Get organizer error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}