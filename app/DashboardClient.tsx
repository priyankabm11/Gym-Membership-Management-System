
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id: number;
  name: string;
  plan: string;
  status: string;
};

type DashboardData = {
  totalMembers: number;
  totalTrainers: number;
  activeMembers: number;
  expiringMembers: number;
  completedPayments: number;
  pendingPayments: number;
  totalAttendance: number;
  members: Member[];
};

export default function Home() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const menu = [
    { name: "Dashboard", path: "/" },
    { name: "Members", path: "/members" },
    { name: "Memberships", path: "/memberships" },
    { name: "Trainers", path: "/trainers" },
    { name: "Attendance", path: "/attendance" },
    { name: "Payments", path: "/payments" },
    { name: "Reports", path: "/reports" },
  ];

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/dashboard");

        if (!response.ok) {
          throw new Error("Could not load dashboard data.");
        }

        const result: DashboardData = await response.json();

        setData(result);
        setMembers(result.members);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const navigateTo = (item: { name: string; path: string }) => {
    setActiveTab(item.name);
    router.push(item.path);
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  };

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col bg-slate-950 p-6 text-white md:flex">
          <h1 className="mb-2 text-2xl font-bold">
            <span className="text-emerald-400">FIT</span>ZONE
          </h1>

          <p className="mb-10 text-sm text-slate-400">
            Gym Management System
          </p>

          <nav className="flex flex-col gap-2">
            {menu.map((item) => (
              <button
                key={item.name}
                onClick={() => navigateTo(item)}
                className={`rounded-xl px-4 py-3 text-left transition ${
                  activeTab === item.name
                    ? "bg-emerald-500 font-semibold text-slate-950"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-xl bg-slate-900 p-4">
            <p className="font-semibold">FitZone Admin</p>
            <p className="mt-1 text-sm text-slate-400">
              Management Dashboard
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
          <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
                FitZone Gym
              </p>

              <h2 className="mt-2 text-3xl font-bold">Dashboard</h2>

              <p className="mt-2 text-slate-500">
                Welcome back! Here is your gym overview.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl bg-white px-5 py-3 shadow-sm">
                <p className="text-sm text-slate-500">Overview</p>
                <p className="font-semibold">Live Database Data</p>
              </div>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </header>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-700">
              {error}
              <button
                onClick={() => window.location.reload()}
                className="ml-3 font-semibold underline"
              >
                Try again
              </button>
            </div>
          )}

          {loading && (
            <p className="mb-6 text-slate-500">
              Loading dashboard data...
            </p>
          )}

          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Total Members</p>
              <h3 className="mt-3 text-3xl font-bold">
                {data?.totalMembers ?? "—"}
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Registered members
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Active Memberships</p>
              <h3 className="mt-3 text-3xl font-bold text-emerald-600">
                {data?.activeMembers ?? "—"}
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Active membership records
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Memberships Expiring Soon
              </p>
              <h3 className="mt-3 text-3xl font-bold text-amber-600">
                {data?.expiringMembers ?? "—"}
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Ending within the next 7 days
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Total Trainers</p>
              <h3 className="mt-3 text-3xl font-bold text-sky-600">
                {data?.totalTrainers ?? "—"}
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Registered trainers
              </p>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Completed Payments</p>
              <h3 className="mt-3 text-2xl font-bold text-emerald-600">
                {data ? formatCurrency(data.completedPayments) : "—"}
              </h3>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Pending Payments</p>
              <h3 className="mt-3 text-2xl font-bold text-amber-600">
                {data ? formatCurrency(data.pendingPayments) : "—"}
              </h3>
            </div>
          </div>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-xl font-bold">Member Directory</h3>
                <p className="mt-1 text-sm text-slate-500">
                  View and search registered members.
                </p>
              </div>

              <input
                type="text"
                placeholder="Search members..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 sm:max-w-xs"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-500">
                    <th className="p-4">Member ID</th>
                    <th className="p-4">Member Name</th>
                    <th className="p-4">Membership Plan</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMembers.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b last:border-0 hover:bg-slate-50"
                    >
                      <td className="p-4 text-slate-500">
                        #{member.id}
                      </td>
                      <td className="p-4 font-semibold">{member.name}</td>
                      <td className="p-4">{member.plan}</td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            member.status === "Active"
                              ? "bg-emerald-100 text-emerald-700"
                              : member.status === "Pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {!loading && filteredMembers.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-6 text-center text-slate-500"
                      >
                        No members found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold">Quick Navigation</h3>
            <p className="mt-1 text-sm text-slate-500">
              Open the different sections of the gym management system.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {menu
                .filter((item) => item.name !== "Dashboard")
                .map((item) => (
                  <button
                    key={item.name}
                    onClick={() => navigateTo(item)}
                    className="rounded-xl border border-slate-200 p-4 text-left font-semibold transition hover:border-emerald-500 hover:bg-emerald-50"
                  >
                    {item.name}
                    <span className="mt-1 block text-sm font-normal text-slate-500">
                      Open {item.name.toLowerCase()}
                    </span>
                  </button>
                ))}
            </div>
          </section>

          <footer className="mt-8 text-center text-xs text-slate-400">
            FitZone Gym Management System
          </footer>
        </section>
      </div>

      <div className="border-t border-slate-800 bg-slate-950 p-3 md:hidden">
        <div className="flex flex-wrap justify-center gap-2">
          {menu.map((item) => (
            <button
              key={item.name}
              onClick={() => navigateTo(item)}
              className="rounded-lg px-3 py-2 text-sm text-white hover:bg-slate-800"
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
