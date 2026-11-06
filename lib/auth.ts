import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export type SessionUser = {
  userId: number;
  email: string;
  role: "admin" | "member";
  memberId: number | null;
};

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("gym_session")?.value;

    if (!token || !process.env.AUTH_SECRET) {
      return null;
    }

    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return {
      userId: Number(payload.userId),
      email: String(payload.email),
      role: payload.role as "admin" | "member",
      memberId: payload.memberId ? Number(payload.memberId) : null,
    };
  } catch {
    return null;
  }
}