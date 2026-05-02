import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Booking from "@/models/Booking";
import { requireAuth } from "@/lib/apiAuth";

// GET /api/reviews?eventId=xxx
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ message: "eventId required" }, { status: 400 });
    }

    const reviews = await Review.find({ event: eventId })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean();

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({ reviews, avgRating }, { status: 200 });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/reviews
export async function POST(request) {
  try {
    const { error, user } = requireAuth(request);
    if (error) return error;

    await connectDB();

    const { eventId, rating, comment } = await request.json();

    if (!eventId || !rating || !comment) {
      return NextResponse.json(
        { message: "eventId, rating and comment are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if already reviewed
    const existing = await Review.findOne({
      user: user.userId,
      event: eventId,
    });

    if (existing) {
      return NextResponse.json(
        { message: "You have already reviewed this event" },
        { status: 409 }
      );
    }

    const review = await Review.create({
      user: user.userId,
      event: eventId,
      rating,
      comment,
    });

    await review.populate("user", "name");

    return NextResponse.json(
      { message: "Review submitted successfully", review },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}