
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const [users]: any = await db.query(
      `SELECT user_id, full_name, email, password_hash, role, member_id
       FROM auth_users
       WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const user = users[0];

    const passwordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (!process.env.AUTH_SECRET) {
      throw new Error("AUTH_SECRET is not configured.");
    }

    const secret = new TextEncoder().encode(
      process.env.AUTH_SECRET
    );

    const token = await new SignJWT({
      userId: user.user_id,
      email: user.email,
      role: user.role,
      memberId: user.member_id,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(secret);

    const response = NextResponse.json({
      message: "Login successful.",
      user: {
        name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("gym_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
