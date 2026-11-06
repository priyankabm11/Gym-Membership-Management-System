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
    const [
      [memberRows],
      [trainerRows],
      [activeRows],
      [expiringRows],
      [paymentRows],
      [attendanceRows],
      [members],
    ]: any[] = await Promise.all([
      db.query("SELECT COUNT(*) AS total FROM member"),

      db.query("SELECT COUNT(*) AS total FROM trainer"),

      db.query(
        "SELECT COUNT(*) AS total FROM membership WHERE status = 'Active'"
      ),

      db.query(
        `SELECT COUNT(*) AS total
         FROM membership
         WHERE status = 'Active'
         AND end_date BETWEEN CURDATE()
         AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)`
      ),

      db.query(
        `SELECT
          COALESCE(
            SUM(CASE WHEN payment_status = 'Completed'
            THEN amount ELSE 0 END), 0
          ) AS completedPayments,
          COALESCE(
            SUM(CASE WHEN payment_status = 'Pending'
            THEN amount ELSE 0 END), 0
          ) AS pendingPayments
        FROM payment`
      ),

      db.query("SELECT COUNT(*) AS total FROM attendance"),

      db.query(
        `SELECT
          m.member_id AS id,
          m.full_name AS name,
          COALESCE(mp.plan_name, 'Not assigned') AS plan,
          COALESCE(ms.status, 'Not assigned') AS status
        FROM member m
        LEFT JOIN membership ms ON m.member_id = ms.member_id
        LEFT JOIN membership_plan mp ON ms.plan_id = mp.plan_id
        ORDER BY m.member_id DESC`
      ),
    ]);

    return NextResponse.json({
      totalMembers: Number(memberRows[0].total),
      totalTrainers: Number(trainerRows[0].total),
      activeMembers: Number(activeRows[0].total),
      expiringMembers: Number(expiringRows[0].total),
      completedPayments: Number(paymentRows[0].completedPayments),
      pendingPayments: Number(paymentRows[0].pendingPayments),
      totalAttendance: Number(attendanceRows[0].total),
      members,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      { error: "Failed to load dashboard data." },
      { status: 500 }
    );
  }
}