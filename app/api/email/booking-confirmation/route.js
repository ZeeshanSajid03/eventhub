import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import { requireAuth } from "@/lib/apiAuth";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { error } = requireAuth(request);
    if (error) return error;

    await connectDB();

    const { bookingId } = await request.json();

    const booking = await Booking.findById(bookingId)
      .populate("event", "title date venue")
      .populate("user", "name email");

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const formattedDate = new Date(booking.event.date).toLocaleDateString(
      "en-US",
      { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    );

    const formattedTime = new Date(booking.event.date).toLocaleTimeString(
      "en-US",
      { hour: "2-digit", minute: "2-digit" }
    );

    await transporter.sendMail({
      from: `"EventHub" <${process.env.EMAIL_USER}>`,
      to: booking.user.email,
      subject: `Booking Confirmed: ${booking.event.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
          <div style="background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Booking Confirmed!</h1>
          </div>

          <p style="color: #374151;">Hi <strong>${booking.user.name}</strong>,</p>
          <p style="color: #6b7280;">Your booking has been confirmed. Here are your details:</p>

          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h2 style="color: #111827; margin-top: 0;">${booking.event.title}</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Date</td>
                <td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 600;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Time</td>
                <td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 600;">${formattedTime}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Venue</td>
                <td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 600;">${booking.event.venue.name}, ${booking.event.venue.city}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Ticket</td>
                <td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 600;">${booking.ticketType} x ${booking.quantity}</td>
              </tr>
              <tr style="border-top: 1px solid #e5e7eb;">
                <td style="padding: 10px 0; color: #111827; font-size: 15px; font-weight: 700;">Total</td>
                <td style="padding: 10px 0; color: #3b82f6; font-size: 15px; font-weight: 700;">Rs. ${booking.totalPrice.toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <p style="color: #6b7280; font-size: 13px;">
            You can view your ticket and QR code in the
            <a href="${process.env.NEXT_PUBLIC_SOCKET_URL}/bookings" style="color: #3b82f6;">My Bookings</a>
            section.
          </p>

          <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
            Free cancellation up to 24 hours before the event.
          </p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: "Confirmation email sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email error:", error);
    // Don't fail the whole booking if email fails
    return NextResponse.json(
      { message: "Email could not be sent" },
      { status: 500 }
    );
  }
}