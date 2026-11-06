import { requireAdmin } from "@/lib/admin";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const [rows] = await db.query(`
      SELECT plan_id, plan_name, duration_months, price, description
      FROM membership_plan
      ORDER BY plan_id ASC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching membership plans:", error);

    return NextResponse.json(
      { error: "Failed to fetch membership plans." },
      { status: 500 }
    );
  }
}
