
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import clientPromise from "@/lib/mongodb";

// GET: Fetch attendance records with member names
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const [rows] = await db.query(`
      SELECT
        a.attendance_id,
        a.member_id,
        m.full_name AS member_name,
        a.attendance_date,
        a.check_in_time,
        a.check_out_time
      FROM attendance a
      JOIN member m ON a.member_id = m.member_id
      ORDER BY a.attendance_date DESC, a.attendance_id DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching attendance:", error);

    return NextResponse.json(
      { error: "Failed to fetch attendance records." },
      { status: 500 }
    );
  }
}

// POST: Record attendance for a member
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { member_id, attendance_date, check_in_time, check_out_time } = body;

    if (
      !Number.isInteger(Number(member_id)) ||
      Number(member_id) <= 0 ||
      typeof attendance_date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(attendance_date) ||
      typeof check_in_time !== "string" ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(check_in_time)
    ) {
      return NextResponse.json(
        { error: "Please provide a valid member, date and check-in time." },
        { status: 400 }
      );
    }

    let cleanCheckOut: string | null = null;

    if (check_out_time) {
      if (
        typeof check_out_time !== "string" ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(check_out_time) ||
        check_out_time < check_in_time
      ) {
        return NextResponse.json(
          { error: "Check-out time cannot be earlier than check-in time." },
          { status: 400 }
        );
      }

      cleanCheckOut = check_out_time;
    }

    
const [result] = await db.execute(
  `INSERT INTO attendance
   (member_id, attendance_date, check_in_time, check_out_time)
   VALUES (?, ?, ?, ?)`,
  [Number(member_id), attendance_date, check_in_time, cleanCheckOut]
);

const attendanceId = (result as { insertId: number }).insertId;

// Log the successful attendance in MongoDB.
// MongoDB failure must not undo the MySQL attendance record.
try {
  const client = await clientPromise;
  const mongoDb = client.db("gym_membership_db");

  await mongoDb.collection("activity_logs").insertOne({
    member_id: Number(member_id),
    activity: "Check-in",
    timestamp: new Date(),
    details: `Attendance recorded for ${attendance_date} at ${check_in_time}. Attendance ID: ${attendanceId}`,
  });
} catch (mongoError) {
  console.error("Attendance saved in MySQL, but MongoDB logging failed:", mongoError);
}

return NextResponse.json(
  {
    message: "Attendance recorded successfully.",
    attendanceId,
  },
  { status: 201 }
);

  } catch (error) {
    console.error("Error recording attendance:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_NO_REFERENCED_ROW_2"
    ) {
      return NextResponse.json(
        { error: "The selected member does not exist." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to record attendance." },
      { status: 500 }
    );
  }
}
