import { NextResponse } from "next/server";

// Socket.io doesn't work natively with Next.js App Router API routes
// We handle it through a custom server. For now this is a placeholder.
export async function GET() {
  return NextResponse.json(
    { message: "Socket.io is handled via custom server" },
    { status: 200 }
  );
}