import { NextResponse } from "next/server";
import { verifyTokenEdge } from "@/lib/authEdge"; // changed this line

// rest of the file stays exactly the same
const protectedRoutes = [
  { path: "/bookings", roles: ["user", "organizer", "admin"] },
  { path: "/checkout", roles: ["user", "organizer", "admin"] },
  { path: "/settings", roles: ["user", "organizer", "admin"] },  // add this
  { path: "/dashboard", roles: ["organizer", "admin"] },
  { path: "/admin", roles: ["admin"] },
];

const authRoutes = ["/login", "/register"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token")?.value || null;
  const decoded = token ? verifyTokenEdge(token) : null; // and this line

  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (decoded) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  const matchedRoute = protectedRoutes.find((route) =>
    pathname.startsWith(route.path)
  );

  if (matchedRoute) {
    if (!decoded) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!matchedRoute.roles.includes(decoded.role)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};