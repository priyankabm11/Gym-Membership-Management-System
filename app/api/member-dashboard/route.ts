import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (session.role !== "member" || !session.memberId) {
      return NextResponse.json(
        { error: "Member access required." },
        { status: 403 }
      );
    }

    const memberId = session.memberId;

    const [memberRows] = await db.query(
      `SELECT member_id, full_name, email
       FROM member
       WHERE member_id = ?`,
      [memberId]
    );

    const member = (memberRows as {
      member_id: number;
      full_name: string;
      email: string;
    }[])[0];

    if (!member) {
      return NextResponse.json(
        { error: "Linked member record not found." },
        { status: 404 }
      );
    }

    const [membershipRows] = await db.query(
      `SELECT
         ms.membership_id,
         mp.plan_name,
         mp.price,
         DATE_FORMAT(ms.start_date, '%Y-%m-%d') AS start_date,
         DATE_FORMAT(ms.end_date, '%Y-%m-%d') AS end_date,
         ms.status
       FROM membership ms
       JOIN Membership_Plan mp ON ms.plan_id = mp.plan_id
       WHERE ms.member_id = ?
       ORDER BY ms.start_date DESC, ms.membership_id DESC`,
      [memberId]
    );

    const [attendanceRows] = await db.query(
      `SELECT
         attendance_id,
         DATE_FORMAT(attendance_date, '%Y-%m-%d') AS attendance_date,
         check_in_time,
         check_out_time
       FROM attendance
       WHERE member_id = ?
       ORDER BY attendance_date DESC, attendance_id DESC
       LIMIT 30`,
      [memberId]
    );

    const [paymentRows] = await db.query(
      `SELECT
         p.payment_id,
         p.amount,
         DATE_FORMAT(p.payment_date, '%Y-%m-%d') AS date,
         p.payment_method AS method,
         p.payment_status AS status
       FROM payment p
       JOIN membership ms ON p.membership_id = ms.membership_id
       WHERE ms.member_id = ?
       ORDER BY p.payment_date DESC, p.payment_id DESC`,
      [memberId]
    );

    return NextResponse.json({
      member,
      memberships: membershipRows,
      attendance: attendanceRows,
      payments: paymentRows,
    });
  } catch (error) {
    console.error("Error loading member dashboard:", error);

    return NextResponse.json(
      { error: "Failed to load member dashboard." },
      { status: 500 }
    );
  }
}
