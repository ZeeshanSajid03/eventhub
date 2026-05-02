import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { requireAdmin } from "@/lib/apiAuth";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { error } = requireAdmin(request);
    if (error) return error;

    await connectDB();

    const { subject, message, targetRole } = await request.json();

    if (!subject || !message) {
      return NextResponse.json(
        { message: "Subject and message are required" },
        { status: 400 }
      );
    }

    // Get target users
    const filter = targetRole && targetRole !== "all"
      ? { role: targetRole }
      : {};

    const users = await User.find(filter).select("email name").lean();

    if (users.length === 0) {
      return NextResponse.json(
        { message: "No users found to send to" },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send in batches of 10 to avoid rate limits
    const batchSize = 10;
    let sent = 0;

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      await Promise.all(
        batch.map((user) =>
          transporter.sendMail({
            from: `"EventHub" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject,
            html: `
              <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
                <div style="background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
                  <h1 style="color: white; margin: 0; font-size: 22px;">EventHub</h1>
                </div>
                <p style="color: #374151;">Hi <strong>${user.name}</strong>,</p>
                <div style="color: #4b5563; line-height: 1.6; white-space: pre-line;">
                  ${message}
                </div>
                <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 16px;">
                  You received this email because you are registered on EventHub.
                </p>
              </div>
            `,
          })
        )
      );
      sent += batch.length;
    }

    return NextResponse.json(
      { message: `Broadcast sent to ${sent} users successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Broadcast error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}