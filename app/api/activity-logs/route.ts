import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();

    const memberId = Number(body.member_id);
    const activity = String(body.activity ?? "").trim();
    const details = String(body.details ?? "").trim();

    if (
      !Number.isInteger(memberId) ||
      memberId <= 0 ||
      !activity ||
      !details
    ) {
      return NextResponse.json(
        { error: "Valid member_id, activity, and details are required." },
        { status: 400 }
      );
    }

    if (session.role === "member" && session.memberId !== memberId) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("gym_membership_db");

    const result = await db.collection("activity_logs").insertOne({
      member_id: memberId,
      activity,
      timestamp: new Date(),
      details,
    });

    return NextResponse.json(
      {
        message: "Activity recorded successfully.",
        id: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error recording activity:", error);

    return NextResponse.json(
      { error: "Could not record activity in MongoDB." },
      { status: 500 }
    );
  }
}
