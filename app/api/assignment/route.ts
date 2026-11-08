
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const [rows] = await db.query(`
      SELECT
        ta.trainer_id,
        t.trainer_name AS trainer,
        ta.member_id,
        m.full_name AS member,
        DATE_FORMAT(ta.assigned_date, '%Y-%m-%d') AS assigned_date,
        DATE_FORMAT(ta.end_date, '%Y-%m-%d') AS end_date
      FROM trainer_assignment ta
      INNER JOIN trainer t
        ON ta.trainer_id = t.trainer_id
      INNER JOIN member m
        ON ta.member_id = m.member_id
      ORDER BY ta.assigned_date DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Fetch trainer assignments error:", error);

    return NextResponse.json(
      { error: "Failed to fetch trainer assignments." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();

    const trainerId = Number(body.trainer_id);
    const memberId = Number(body.member_id);
    const assignedDate = body.assigned_date;
    const endDate = body.end_date || null;

    if (
      !Number.isInteger(trainerId) ||
      trainerId <= 0 ||
      !Number.isInteger(memberId) ||
      memberId <= 0 ||
      typeof assignedDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(assignedDate) ||
      (endDate !== null &&
        (typeof endDate !== "string" ||
          !/^\d{4}-\d{2}-\d{2}$/.test(endDate)))
    ) {
      return NextResponse.json(
        { error: "Please provide valid trainer, member, and date details." },
        { status: 400 }
      );
    }

    if (endDate && endDate < assignedDate) {
      return NextResponse.json(
        { error: "End date cannot be before the assigned date." },
        { status: 400 }
      );
    }

    await db.query(
      `INSERT INTO trainer_assignment
        (trainer_id, member_id, assigned_date, end_date)
       VALUES (?, ?, ?, ?)`,
      [trainerId, memberId, assignedDate, endDate]
    );

    return NextResponse.json(
      { message: "Trainer assigned successfully." },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create trainer assignment error:", error);

    const errorCode =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "string"
        ? error.code
        : undefined;

    if (errorCode === "ER_NO_REFERENCED_ROW_2") {
      return NextResponse.json(
        { error: "The selected trainer or member does not exist." },
        { status: 400 }
      );
    }

    if (errorCode === "ER_DUP_ENTRY") {
      return NextResponse.json(
        {
          error:
            "This trainer is already assigned to this member on that date.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create trainer assignment." },
      { status: 500 }
    );
  }
}
