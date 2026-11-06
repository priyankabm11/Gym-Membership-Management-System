import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import DashboardClient from "./DashboardClient";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect("/member-dashboard");
  }

  return <DashboardClient />;
}
