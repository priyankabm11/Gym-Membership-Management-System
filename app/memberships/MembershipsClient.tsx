
"use client";

import { useEffect, useState } from "react";

type Member = {
  member_id: number;
  full_name: string;
};

type Plan = {
  plan_id: number;
  plan_name: string;
  duration_months: number;
  price: string | number;
  description: string | null;
};

type Membership = {
  membership_id: number;
  member_id: number;
  member: string;
  plan_id: number;
  plan_name: string;
  duration_months: number;
  price: string | number;
  start_date: string;
  end_date: string;
  status: string;
};

export default function MembershipsPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [memberId, setMemberId] = useState("");
  const [planId, setPlanId] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [membersRes, plansRes, membershipsRes] = await Promise.all([
        fetch("/api/members"),
        fetch("/api/membership-plans"),
        fetch("/api/memberships"),
      ]);

      if (!membersRes.ok || !plansRes.ok || !membershipsRes.ok) {
        throw new Error("Could not load membership data.");
      }

      const membersData = await membersRes.json();
      const plansData = await plansRes.json();
      const membershipsData = await membershipsRes.json();

      setMembers(membersData);
      setPlans(plansData);
      setMemberships(membershipsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  loadData();

  function handleWindowFocus() {
    loadData();
  }

  window.addEventListener("focus", handleWindowFocus);

  return () => {
    window.removeEventListener("focus", handleWindowFocus);
  };
}, []);

  const selectedPlan = plans.find(
    (plan) => plan.plan_id === Number(planId)
  );

  function calculateEndDate(date: string, months: number) {
    if (!date || !months) return "";

    const result = new Date(`${date}T12:00:00`);
    const originalDay = result.getDate();

    result.setDate(1);
    result.setMonth(result.getMonth() + months);

    const lastDay = new Date(
      result.getFullYear(),
      result.getMonth() + 1,
      0
    ).getDate();

    result.setDate(Math.min(originalDay, lastDay));

    const year = result.getFullYear();
    const month = String(result.getMonth() + 1).padStart(2, "0");
    const day = String(result.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function formatDate(date: string) {
    if (!date) return "—";

    const datePart = date.slice(0, 10);
    const parts = datePart.split("-");

    if (parts.length !== 3) return datePart;

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  async function createMembership(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!memberId || !planId || !startDate) {
      setError("Please fill in all the required fields.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: Number(memberId),
          plan_id: Number(planId),
          start_date: startDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create membership.");
      }

      setMessage("Membership created successfully!");
      setMemberId("");
      setPlanId("");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create membership."
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(membershipId: number, status: string) {
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/memberships", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membership_id: membershipId,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update status.");
      }

      setMessage("Membership status updated!");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update status."
      );
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-gray-900 md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Membership Management</h1>
          <p className="mt-2 text-gray-600">
            Manage member plans, durations, renewals, and membership status.
          </p>
        </div>

        {message && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold">
            Assign a Membership
          </h2>

          <form
            onSubmit={createMembership}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            <div>
              <label className="mb-2 block text-sm font-medium">
                Select Member
              </label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white p-3"
              >
                <option value="">Choose a member</option>
                {members.map((member) => (
                  <option key={member.member_id} value={member.member_id}>
                    {member.full_name} (ID: {member.member_id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Membership Plan
              </label>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white p-3"
              >
                <option value="">Choose a plan</option>
                {plans.map((plan) => (
                  <option key={plan.plan_id} value={plan.plan_id}>
                    {plan.plan_name} — ₹{Number(plan.price).toLocaleString("en-IN")}
                    {" "}({plan.duration_months} months)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 p-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Calculated End Date
              </label>
              <input
                type="text"
                readOnly
                value={
                  selectedPlan
                    ? formatDate(
                        calculateEndDate(
                          startDate,
                          selectedPlan.duration_months
                        )
                      )
                    : "Select a plan first"
                }
                className="w-full rounded-lg border border-gray-200 bg-gray-100 p-3"
              />
            </div>

            {selectedPlan && (
              <div className="rounded-lg bg-gray-50 p-4 md:col-span-2">
                <p className="font-medium">{selectedPlan.plan_name} Plan</p>
                <p className="mt-1 text-sm text-gray-600">
                  Duration: {selectedPlan.duration_months} months
                </p>
                <p className="mt-1 text-lg font-bold">
                  ₹{Number(selectedPlan.price).toLocaleString("en-IN")}
                </p>
                {selectedPlan.description && (
                  <p className="mt-1 text-sm text-gray-600">
                    {selectedPlan.description}
                  </p>
                )}
              </div>
            )}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving || loading}
                className="rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Assign Membership"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">All Memberships</h2>
              <p className="mt-1 text-sm text-gray-500">
                Total records: {memberships.length}
              </p>
            </div>

            <button
              type="button"
              onClick={loadData}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="py-8 text-center text-gray-500">
              Loading memberships...
            </p>
          ) : memberships.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              No memberships found. Assign one using the form above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-600">
                    <th className="p-3">ID</th>
                    <th className="p-3">Member</th>
                    <th className="p-3">Plan</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Start Date</th>
                    <th className="p-3">End Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {memberships.map((membership) => (
                    <tr
                      key={membership.membership_id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="p-3">{membership.membership_id}</td>
                      <td className="p-3 font-medium">
                        {membership.member}
                      </td>
                      <td className="p-3">
                        {membership.plan_name}
                        <p className="text-xs text-gray-500">
                          {membership.duration_months} months
                        </p>
                      </td>
                      <td className="p-3">
                        ₹{Number(membership.price).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3">
                        {formatDate(membership.start_date)}
                      </td>
                      <td className="p-3">
                        {formatDate(membership.end_date)}
                      </td>
                      <td className="p-3">
                        <select
                          value={membership.status}
                          onChange={(e) =>
                            updateStatus(
                              membership.membership_id,
                              e.target.value
                            )
                          }
                          className="rounded-lg border border-gray-300 bg-white p-2"
                          aria-label={`Status for membership ${membership.membership_id}`}
                        >
                          <option value="Active">Active</option>
                          <option value="Expired">Expired</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
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
