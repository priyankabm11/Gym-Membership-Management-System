
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const [
      [memberRows],
      [trainerRows],
      [paymentRows],
      [attendanceRows],
      [dailyAttendanceRows],
    ] = await Promise.all([
      db.query("SELECT COUNT(*) AS total FROM member"),
      db.query("SELECT COUNT(*) AS total FROM trainer"),
      db.query(`
        SELECT
          p.payment_id,
          m.full_name AS member,
          p.amount,
          DATE_FORMAT(p.payment_date, '%Y-%m-%d') AS date,
          p.payment_status AS status
        FROM payment p
        JOIN membership ms ON p.membership_id = ms.membership_id
        JOIN member m ON ms.member_id = m.member_id
        ORDER BY p.payment_date DESC, p.payment_id DESC
      `),
      db.query("SELECT COUNT(*) AS total FROM attendance"),
      db.query(`
        SELECT
          DATE_FORMAT(attendance_date, '%Y-%m-%d') AS date,
          COUNT(*) AS count
        FROM attendance
        GROUP BY attendance_date
        ORDER BY attendance_date DESC
      `),
    ]);

    const payments = paymentRows as {
      payment_id: number;
      member: string;
      amount: string | number;
      date: string;
      status: string;
    }[];

    const completedPayments = payments
      .filter((p) => p.status === "Completed")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const pendingPayments = payments
      .filter((p) => p.status === "Pending")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return NextResponse.json({
      totalMembers: Number(
        (memberRows as { total: number }[])[0].total
      ),
      totalTrainers: Number(
        (trainerRows as { total: number }[])[0].total
      ),
      totalAttendance: Number(
        (attendanceRows as { total: number }[])[0].total
      ),
      completedPayments,
      pendingPayments,
      payments,
      attendance: (dailyAttendanceRows as {
        date: string;
        count: number;
      }[]).map((day) => ({
        date: day.date,
        count: Number(day.count),
      })),
    });
  } catch (error) {
    console.error("Error fetching reports:", error);

    return NextResponse.json(
      { error: "Failed to fetch report data." },
      { status: 500 }
    );
  }
}
