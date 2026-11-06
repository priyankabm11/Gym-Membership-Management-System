
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const denied = await requireAdmin();

  if (denied) {
    return denied;
  }

  try {
    const [rows] = await db.query("SHOW TABLES");

    return NextResponse.json({
      success: true,
      message: "Connected to MySQL successfully!",
      tables: rows,
    });
  } catch (error) {
    const err = error as {
      code?: string;
      message?: string;
    };

    console.error("Database connection error:", err.code, err.message);

    return NextResponse.json(
      {
        success: false,
        errorCode: err.code ?? "UNKNOWN",
        errorMessage: err.message ?? "Unknown database error",
      },
      { status: 500 }
    );
  }
}
