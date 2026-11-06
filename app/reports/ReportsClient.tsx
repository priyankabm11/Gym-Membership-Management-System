
"use client";

import { useEffect, useState } from "react";

type AttendanceDay = {
  date: string;
  count: number;
};

type Payment = {
  payment_id: number;
  member: string;
  amount: string | number;
  date: string;
  status: string;
};

type ReportData = {
  totalMembers: number;
  totalTrainers: number;
  totalAttendance: number;
  completedPayments: number;
  pendingPayments: number;
  payments: Payment[];
  attendance: AttendanceDay[];
};

export default function ReportsPage() {
  const [reportType, setReportType] = useState("All");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReports() {
      try {
        const response = await fetch("/api/reports");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load reports.");
        }

        setReportData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load reports."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadReports();
  }, []);

  const currency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);

  const filteredPayments = (reportData?.payments ?? []).filter(
    (payment) =>
      reportType === "All" || payment.status === reportType
  );

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
            FitZone Gym
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="mt-2 text-gray-600">
            Review attendance, payments, and membership activity.
          </p>
        </div>

        {error && (
          <div
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        {loading && (
          <p className="mb-6 text-sm text-gray-500">
            Loading reports from the database...
          </p>
        )}

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total Members</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              {reportData?.totalMembers ?? "—"}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Registered members
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total Trainers</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              {reportData?.totalTrainers ?? "—"}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Registered trainers
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Completed Payments</p>
            <h2 className="mt-3 text-3xl font-bold text-green-600">
              {reportData
                ? currency(reportData.completedPayments)
                : "—"}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Successfully recorded
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Pending Payments</p>
            <h2 className="mt-3 text-3xl font-bold text-orange-600">
              {reportData
                ? currency(reportData.pendingPayments)
                : "—"}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Awaiting payment
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Attendance Report
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Attendance recorded for each day.
              </p>
            </div>

            <div className="rounded-xl bg-orange-50 px-4 py-3">
              <p className="text-sm text-orange-700">Total Check-ins</p>
              <p className="text-2xl font-bold text-orange-700">
                {reportData?.totalAttendance ?? "—"}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="p-4">Date</th>
                  <th className="p-4">Attendance Count</th>
                </tr>
              </thead>
              <tbody>
                {reportData?.attendance.map((day) => (
                  <tr key={day.date} className="border-b last:border-0">
                    <td className="p-4 font-medium text-gray-800">
                      {day.date}
                    </td>
                    <td className="p-4 text-gray-700">
                      {day.count} {day.count === 1 ? "check-in" : "check-ins"}
                    </td>
                  </tr>
                ))}

                {!loading && reportData?.attendance.length === 0 && (
                  <tr>
                    <td colSpan={2} className="p-6 text-center text-gray-500">
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Payment Report
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Review payment amounts and statuses.
              </p>
            </div>

            <select
              value={reportType}
              onChange={(event) => setReportType(event.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none focus:border-orange-500"
            >
              <option value="All">All Payments</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="p-4">Member</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.payment_id}
                    className="border-b last:border-0"
                  >
                    <td className="p-4 font-medium text-gray-800">
                      {payment.member}
                    </td>
                    <td className="p-4 text-gray-700">
                      {currency(Number(payment.amount))}
                    </td>
                    <td className="p-4 text-gray-700">
                      {payment.date}
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          payment.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : payment.status === "Pending"
                            ? "bg-orange-100 text-orange-700"
                            : payment.status === "Refunded"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {!loading && filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-500">
                      No payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-gray-500">
          FitZone Gym Management System · Live database reports
        </p>
      </div>
    </main>
  );
}
