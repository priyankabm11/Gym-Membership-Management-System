
"use client";

import { useEffect, useState } from "react";

type Payment = {
  payment_id: number;
  membership_id: number;
  member_id: number;
  member: string;
  amount: string | number;
  date: string;
  method: string;
  status: string;
};

type Membership = {
  membership_id: number;
  member_id: number;
  member: string;
};

const methods = ["UPI", "Card", "Cash", "Net Banking"];
const statuses = ["Completed", "Pending", "Failed", "Refunded"];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [membershipId, setMembershipId] = useState("");
  const [amount, setAmount] = useState("1500");
  const [date, setDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });
  const [method, setMethod] = useState("UPI");
  const [status, setStatus] = useState("Completed");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    try {
      const [paymentResponse, membershipResponse] = await Promise.all([
        fetch("/api/payments"),
        fetch("/api/memberships"),
      ]);

      const paymentData = await paymentResponse.json();
      const membershipData = await membershipResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentData.error || "Could not load payments.");
      }

      if (!membershipResponse.ok) {
        throw new Error(membershipData.error || "Could not load memberships.");
      }

      setPayments(paymentData);
      setMemberships(membershipData);

      if (membershipData.length > 0 && !membershipId) {
        setMembershipId(String(membershipData[0].membership_id));
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to load payment data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function recordPayment() {
    if (!membershipId || !date || !method || !status) {
      setMessage("Please complete all required fields.");
      return;
    }

    const numericAmount = Number(amount);

    if (!amount.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setMessage("Enter a payment amount greater than zero.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membership_id: Number(membershipId),
          amount: numericAmount,
          date,
          method,
          status,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not record payment.");
      }

      await loadData();
      setMessage("Payment recorded successfully!");
      setAmount("1500");
      setStatus("Completed");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to record payment."
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredPayments = payments.filter(
    (payment) =>
      payment.member.toLowerCase().includes(search.toLowerCase()) ||
      payment.status.toLowerCase().includes(search.toLowerCase()) ||
      payment.date.includes(search)
  );

  const completedRevenue = payments
    .filter((payment) => payment.status === "Completed")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  const pendingAmount = payments
    .filter((payment) => payment.status === "Pending")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  const currency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <main className="min-h-screen bg-slate-100 p-5 text-slate-900 md:p-9">
      <div className="mx-auto max-w-7xl">
        <a href="/" className="text-sm font-medium text-emerald-700 hover:underline">
          ← Back to Dashboard
        </a>

        <header className="mt-5">
          <p className="text-sm text-slate-500">Gym Management / Finance</p>
          <h1 className="mt-1 text-3xl font-bold">Payments Management</h1>
          <p className="mt-2 text-slate-500">
            Record payments and review payment history.
          </p>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Completed Revenue</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {currency(completedRevenue)}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Pending Payments</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {currency(pendingAmount)}
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Record a Payment</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm font-medium">
              Membership / Member
              <select
                value={membershipId}
                onChange={(event) => setMembershipId(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
                disabled={memberships.length === 0}
              >
                {memberships.map((membership) => (
                  <option
                    key={membership.membership_id}
                    value={membership.membership_id}
                  >
                    {membership.member} (Membership #{membership.membership_id})
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium">
              Amount (₹)
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 p-3"
              />
            </label>

            <label className="text-sm font-medium">
              Payment date
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 p-3"
              />
            </label>

            <label className="text-sm font-medium">
              Payment method
              <select
                value={method}
                onChange={(event) => setMethod(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
              >
                {methods.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>

            <label className="text-sm font-medium">
              Payment status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
              >
                {statuses.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>

          <button
            onClick={recordPayment}
            disabled={saving || loading || memberships.length === 0}
            className="mt-5 rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "+ Record Payment"}
          </button>

          {memberships.length === 0 && !loading && (
            <p className="mt-3 text-sm text-amber-700">
              No memberships found. Add a membership before recording a payment.
            </p>
          )}

          {message && (
            <p className="mt-4 text-sm font-medium" role="status">{message}</p>
          )}
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Payment History</h2>
              <p className="mt-1 text-sm text-slate-500">
                {loading ? "Loading..." : `${filteredPayments.length} payment(s) displayed`}
              </p>
            </div>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search member, date or status..."
              className="w-full rounded-lg border border-slate-300 p-3 sm:w-72"
            />
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="p-3">Member</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.payment_id} className="border-b last:border-0">
                    <td className="p-3 font-medium">{payment.member}</td>
                    <td className="p-3">{currency(Number(payment.amount))}</td>
                    <td className="p-3">{payment.date}</td>
                    <td className="p-3">{payment.method}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        payment.status === "Completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : payment.status === "Pending"
                          ? "bg-amber-100 text-amber-700"
                          : payment.status === "Refunded"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!loading && filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      No payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
