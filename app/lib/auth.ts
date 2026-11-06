import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function getSession() {
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
      role: String(payload.role),
      memberId:
        payload.memberId === null || payload.memberId === undefined
          ? null
          : Number(payload.memberId),
    };
  } catch {
    return null;
  }
}