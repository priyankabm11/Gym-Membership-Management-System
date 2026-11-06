
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("gym_session")?.value;
  const { pathname } = request.nextUrl;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role;

    if (pathname.startsWith("/member-dashboard") && role !== "member") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const adminRoutes = [
      "/members",
      "/memberships",
      "/trainers",
      "/attendance",
      "/payments",
      "/reports",
    ];

    if (
      adminRoutes.some((route) => pathname.startsWith(route)) &&
      role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/member-dashboard", request.url));
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(
      new URL("/login", request.url)
    );
    response.cookies.delete("gym_session");
    return response;
  }
}

export const config = {
  matcher: [
    "/members/:path*",
    "/memberships/:path*",
    "/trainers/:path*",
    "/attendance/:path*",
    "/payments/:path*",
    "/reports/:path*",
    "/member-dashboard/:path*",
  ],
};
