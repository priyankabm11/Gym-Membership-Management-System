
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

// GET: Fetch payment history with the corresponding member's name
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const [rows] = await db.query(`
      SELECT
        p.payment_id,
        p.membership_id,
        m.member_id,
        m.full_name AS member,
        p.amount,
        DATE_FORMAT(p.payment_date, '%Y-%m-%d') AS date,
        p.payment_method AS method,
        p.payment_status AS status
      FROM payment p
      JOIN membership ms ON p.membership_id = ms.membership_id
      JOIN member m ON ms.member_id = m.member_id
      ORDER BY p.payment_date DESC, p.payment_id DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments." },
      { status: 500 }
    );
  }
}

// POST: Record a new payment
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();

    const membershipId = Number(body.membership_id);
    const amount = Number(body.amount);
    const date = body.date;
    const method = body.method;
    const status = body.status;

    if (!Number.isInteger(membershipId) || membershipId <= 0) {
      return NextResponse.json(
        { error: "Please select a valid membership." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Payment amount must be greater than zero." },
        { status: 400 }
      );
    }

    if (
      typeof date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !["UPI", "Card", "Cash", "Net Banking"].includes(method) ||
      !["Completed", "Pending", "Failed", "Refunded"].includes(status)
    ) {
      return NextResponse.json(
        { error: "Please provide valid payment details." },
        { status: 400 }
      );
    }

    const [membershipRows] = await db.query(
  `SELECT membership_id, status, end_date
   FROM membership
   WHERE membership_id = ?`,
  [membershipId]
);

const membership = (membershipRows as {
  membership_id: number;
  status: string;
  end_date: string;
}[])[0];

if (!membership) {
  return NextResponse.json(
    { error: "The selected membership does not exist." },
    { status: 400 }
  );
}

if (membership.status !== "Active") {
  return NextResponse.json(
    { error: "Cannot record a payment for a cancelled or expired membership." },
    { status: 400 }
  );
}

    const [result] = await db.query(
      `INSERT INTO payment
        (membership_id, amount, payment_date, payment_method, payment_status)
       VALUES (?, ?, ?, ?, ?)`,
      [membershipId, amount, date, method, status]
    );

    return NextResponse.json(
      {
        message: "Payment recorded successfully.",
        payment_id: (result as { insertId: number }).insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error recording payment:", error);
    return NextResponse.json(
      { error: "Failed to record payment." },
      { status: 500 }
    );
  }
}
