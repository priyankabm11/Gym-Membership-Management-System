"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DashboardData = {
  member: {
    member_id: number;
    full_name: string;
    email: string;
  };
  memberships: {
    membership_id: number;
    plan_name: string;
    price: number;
    start_date: string;
    end_date: string;
    status: string;
  }[];
  attendance: {
    attendance_id: number;
    attendance_date: string;
    check_in_time: string;
    check_out_time: string | null;
  }[];
  payments: {
    payment_id: number;
    amount: number;
    date: string;
    method: string;
    status: string;
  }[];
};

export default function MemberDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch("/api/member-dashboard");

        if (response.status === 401 || response.status === 403) {
          router.replace("/login");
          return;
        }

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Unable to load dashboard.");
        }

        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  if (loading) {
    return <p className="p-8">Loading your dashboard...</p>;
  }

  if (error) {
    return <p className="p-8 text-red-600">{error}</p>;
  }

  if (!data) return null;

  const latestMembership = data.memberships[0];

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl space-y-6">

        <div className="flex items-center justify-between rounded-xl bg-white p-6 shadow">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Member Dashboard
            </h1>
            <p className="mt-1 text-gray-500">
              Welcome, {data.member.full_name}!
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="font-semibold text-gray-500">Member ID</h2>
            <p className="mt-3 text-2xl font-bold">
              {data.member.member_id}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="font-semibold text-gray-500">Membership Plan</h2>
            <p className="mt-3 text-xl font-bold">
              {latestMembership?.plan_name ?? "No plan"}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="font-semibold text-gray-500">Membership Status</h2>
            <p className="mt-3 text-xl font-bold">
              {latestMembership?.status ?? "Not enrolled"}
            </p>
          </div>
        </div>

        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">My Memberships</h2>

          {data.memberships.length === 0 ? (
            <p className="text-gray-500">No membership records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="p-3">Plan</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Start Date</th>
                    <th className="p-3">End Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.memberships.map((item) => (
                    <tr key={item.membership_id} className="border-b">
                      <td className="p-3">{item.plan_name}</td>
                      <td className="p-3">₹{item.price}</td>
                      <td className="p-3">{item.start_date}</td>
                      <td className="p-3">{item.end_date}</td>
                      <td className="p-3">{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">My Attendance</h2>

          {data.attendance.length === 0 ? (
            <p className="text-gray-500">No attendance records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="p-3">Date</th>
                    <th className="p-3">Check-in</th>
                    <th className="p-3">Check-out</th>
                  </tr>
                </thead>
                <tbody>
                  {data.attendance.map((item) => (
                    <tr key={item.attendance_id} className="border-b">
                      <td className="p-3">{item.attendance_date}</td>
                      <td className="p-3">{item.check_in_time}</td>
                      <td className="p-3">{item.check_out_time ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">My Payment History</h2>

          {data.payments.length === 0 ? (
            <p className="text-gray-500">No payment records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="p-3">Date</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map((item) => (
                    <tr key={item.payment_id} className="border-b">
                      <td className="p-3">{item.date}</td>
                      <td className="p-3">₹{item.amount}</td>
                      <td className="p-3">{item.method}</td>
                      <td className="p-3">{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}