
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

// GET: Fetch all trainers from MySQL
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const [rows] = await db.query(
      `SELECT trainer_id, trainer_name, specialization, phone, email
       FROM trainer
       ORDER BY trainer_id DESC`
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching trainers:", error);

    return NextResponse.json(
      { error: "Failed to fetch trainers." },
      { status: 500 }
    );
  }
}

// POST: Add a new trainer to MySQL
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();

    const { name, specialization, phone, email } = body;

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return NextResponse.json(
        { error: "Trainer name is required." },
        { status: 400 }
      );
    }

    const cleanSpecialization =
      typeof specialization === "string" && specialization.trim()
        ? specialization.trim()
        : null;

    const cleanPhone =
      typeof phone === "string" && phone.trim()
        ? phone.trim()
        : null;

    const cleanEmail =
      typeof email === "string" && email.trim()
        ? email.trim()
        : null;

    const [result] = await db.execute(
      `INSERT INTO trainer
       (trainer_name, specialization, phone, email)
       VALUES (?, ?, ?, ?)`,
      [
        name.trim(),
        cleanSpecialization,
        cleanPhone,
        cleanEmail,
      ]
    );

    return NextResponse.json(
      {
        message: "Trainer added successfully.",
        trainerId: (result as { insertId: number }).insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding trainer:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_DUP_ENTRY"
    ) {
      return NextResponse.json(
        { error: "This phone number or email already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add trainer." },
      { status: 500 }
    );
  }
}
