
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must contain at least 8 characters." },
        { status: 400 }
      );
    }

    const [members]: any = await db.query(
      "SELECT member_id, full_name, email FROM Member WHERE LOWER(email) = ?",
      [email]
    );

    if (members.length === 0) {
      return NextResponse.json(
        { error: "No gym member found with this email. Please contact the gym administrator." },
        { status: 404 }
      );
    }

    const member = members[0];

    const [existingUsers]: any = await db.query(
      "SELECT user_id FROM auth_users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.query(
      `INSERT INTO auth_users
       (full_name, email, password_hash, role, member_id)
       VALUES (?, ?, ?, 'member', ?)`,
      [member.full_name, email, passwordHash, member.member_id]
    );

    return NextResponse.json(
      { message: "Registration successful. You can now log in." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
