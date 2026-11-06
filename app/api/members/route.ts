import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { error: "Unauthorized. Admin access required." },
      { status: 403 }
    );
  }

  try {
    const [rows] = await db.query(
      `SELECT member_id, full_name, email, phone, gender
       FROM member
       ORDER BY member_id DESC`
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching members:", error);

    return NextResponse.json(
      { error: "Failed to fetch members." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { error: "Unauthorized. Admin access required." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { name, email, phone, gender } = body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof gender !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !gender.trim()
    ) {
      return NextResponse.json(
        { error: "Please fill all required fields." },
        { status: 400 }
      );
    }

    const [result] = await db.execute(
      `INSERT INTO member (full_name, email, phone, gender)
       VALUES (?, ?, ?, ?)`,
      [name.trim(), email.trim(), phone.trim(), gender.trim()]
    );

    const insertResult = result as { insertId: number };

    return NextResponse.json(
      {
        message: "Member added successfully.",
        member_id: insertResult.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    const err = error as { code?: string };

    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "This email is already registered." },
        { status: 409 }
      );
    }

    console.error("Error adding member:", error);

    return NextResponse.json(
      { error: "Failed to add member." },
      { status: 500 }
    );
  }
}
