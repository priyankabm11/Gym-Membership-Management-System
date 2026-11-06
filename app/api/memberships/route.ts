
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

// GET: Fetch memberships with member and plan details
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const [rows] = await db.query(`
      SELECT
        ms.membership_id,
        ms.member_id,
        m.full_name AS member,
        ms.plan_id,
        mp.plan_name,
        mp.duration_months,
        mp.price,
        ms.start_date,
        ms.end_date,
        ms.status
      FROM membership ms
      JOIN member m ON ms.member_id = m.member_id
      JOIN membership_plan mp ON ms.plan_id = mp.plan_id
      ORDER BY ms.membership_id DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching memberships:", error);

    return NextResponse.json(
      { error: "Failed to fetch memberships." },
      { status: 500 }
    );
  }
}

// POST: Create a new membership
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();

    const memberId = Number(body.member_id);
    const planId = Number(body.plan_id);
    const startDate = body.start_date;

    if (
      !Number.isInteger(memberId) ||
      memberId <= 0 ||
      !Number.isInteger(planId) ||
      planId <= 0 ||
      typeof startDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(startDate)
    ) {
      return NextResponse.json(
        { error: "Please provide a valid member, plan, and start date." },
        { status: 400 }
      );
    }

    const [members] = await db.query(
      "SELECT member_id FROM member WHERE member_id = ?",
      [memberId]
    );

    if ((members as any[]).length === 0) {
      return NextResponse.json(
        { error: "Selected member does not exist." },
        { status: 404 }
      );
    }

    const [plans] = await db.query(
      `SELECT duration_months FROM membership_plan WHERE plan_id = ?`,
      [planId]
    );

    const planRows = plans as any[];

    if (planRows.length === 0) {
      return NextResponse.json(
        { error: "Selected membership plan does not exist." },
        { status: 404 }
      );
    }

    // Calculate the end date using the selected plan duration.
    const duration = Number(planRows[0].duration_months);

    const [result] = await db.query(
      `INSERT INTO membership
        (member_id, plan_id, start_date, end_date, status)
       VALUES (?, ?, ?, DATE_ADD(?, INTERVAL ? MONTH), 'Active')`,
      [memberId, planId, startDate, startDate, duration]
    );

    return NextResponse.json(
      {
        message: "Membership created successfully.",
        membership_id: (result as any).insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating membership:", error);

    return NextResponse.json(
      { error: "Failed to create membership." },
      { status: 500 }
    );
  }
}

// PATCH: Update a membership's status
export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const membershipId = Number(body.membership_id);
    const status = body.status;

    const allowedStatuses = ["Active", "Expired", "Cancelled"];

    if (
      !Number.isInteger(membershipId) ||
      membershipId <= 0 ||
      !allowedStatuses.includes(status)
    ) {
      return NextResponse.json(
        { error: "Please provide a valid membership ID and status." },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      "UPDATE membership SET status = ? WHERE membership_id = ?",
      [status, membershipId]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: "Membership not found or status unchanged." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Membership status updated successfully.",
    });
  } catch (error) {
    console.error("Error updating membership:", error);

    return NextResponse.json(
      { error: "Failed to update membership status." },
      { status: 500 }
    );
  }
}
