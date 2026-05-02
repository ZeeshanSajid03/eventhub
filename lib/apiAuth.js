import { getUserFromRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

// Use this inside any API route that needs auth
export function requireAuth(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return {
      error: NextResponse.json(
        { message: "Unauthorized. Please login." },
        { status: 401 }
      ),
      user: null,
    };
  }
  return { error: null, user };
}

// Use this for organizer/admin only API routes
export function requireOrganizer(request) {
  const { error, user } = requireAuth(request);
  if (error) return { error, user: null };

  if (user.role !== "organizer" && user.role !== "admin") {
    return {
      error: NextResponse.json(
        { message: "Forbidden. Organizer access required." },
        { status: 403 }
      ),
      user: null,
    };
  }

  return { error: null, user };
}

// Use this for admin only API routes
export function requireAdmin(request) {
  const { error, user } = requireAuth(request);
  if (error) return { error, user: null };

  if (user.role !== "admin") {
    return {
      error: NextResponse.json(
        { message: "Forbidden. Admin access required." },
        { status: 403 }
      ),
      user: null,
    };
  }

  return { error: null, user };
}