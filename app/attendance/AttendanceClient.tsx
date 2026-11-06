
"use client";

import { useEffect, useState } from "react";

type Member = {
  member_id: number;
  full_name: string;
};

type AttendanceRecord = {
  attendance_id: number;
  member_id: number;
  member_name: string;
  attendance_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
};

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberId, setMemberId] = useState("");
  const [date, setDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [checkIn, setCheckIn] = useState("09:00");
  const [checkOut, setCheckOut] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    try {
      setLoading(true);

      const [attendanceResponse, membersResponse] = await Promise.all([
        fetch("/api/attendance"),
        fetch("/api/members"),
      ]);

      const attendanceData = await attendanceResponse.json();
      const membersData = await membersResponse.json();

      if (!attendanceResponse.ok) {
        throw new Error("Could not load attendance records.");
      }

      if (!membersResponse.ok) {
        throw new Error("Could not load members.");
      }

      setRecords(attendanceData);
      setMembers(membersData);

      setMemberId((current) => {
        if (
          current &&
          membersData.some(
            (item: Member) => item.member_id.toString() === current
          )
        ) {
          return current;
        }

        return membersData.length
          ? membersData[0].member_id.toString()
          : "";
      });
    } catch (error) {
      console.error("Error loading attendance data:", error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to load attendance data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function recordAttendance() {
    if (!memberId || !date || !checkIn) {
      setMessage("Please select a member, date and check-in time.");
      return;
    }

    if (checkOut && checkOut < checkIn) {
      setMessage("Check-out time cannot be earlier than check-in time.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          member_id: Number(memberId),
          attendance_date: date,
          check_in_time: checkIn,
          check_out_time: checkOut || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to record attendance.");
      }

      await loadData();
      setCheckOut("");
      setMessage("Attendance recorded and saved to MySQL!");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to record attendance."
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredRecords = records.filter(
    (record) =>
      record.member_name.toLowerCase().includes(search.toLowerCase()) ||
      record.attendance_date.includes(search)
  );

  function formatTime(time: string | null) {
    return time ? time.slice(0, 5) : "—";
  }

  return (
    <main className="min-h-screen bg-slate-100 p-5 text-slate-900 md:p-9">
      <div className="mx-auto max-w-7xl">
        <a
          href="/"
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          ← Back to Dashboard
        </a>

        <header className="mt-5">
          <p className="text-sm text-slate-500">
            Gym Management / Operations
          </p>
          <h1 className="mt-1 text-3xl font-bold">
            Attendance Management
          </h1>
          <p className="mt-2 text-slate-500">
            Record member check-ins and check-outs.
          </p>
        </header>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Record Attendance</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm font-medium">
              Member
              <select
                value={memberId}
                onChange={(event) => setMemberId(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
              >
                {members.map((item) => (
                  <option key={item.member_id} value={item.member_id}>
                    {item.full_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium">
              Attendance date
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 p-3"
              />
            </label>

            <label className="text-sm font-medium">
              Check-in time
              <input
                type="time"
                value={checkIn}
                onChange={(event) => setCheckIn(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 p-3"
              />
            </label>

            <label className="text-sm font-medium">
              Check-out time (optional)
              <input
                type="time"
                value={checkOut}
                onChange={(event) => setCheckOut(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 p-3"
              />
            </label>
          </div>

          <button
            onClick={recordAttendance}
            disabled={saving || loading || members.length === 0}
            className="mt-5 rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "+ Record Attendance"}
          </button>

          {members.length === 0 && !loading && (
            <p className="mt-3 text-sm text-amber-700">
              Add a member before recording attendance.
            </p>
          )}

          {message && (
            <p className="mt-4 text-sm font-medium" role="status">
              {message}
            </p>
          )}
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Attendance Records</h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredRecords.length} record(s) displayed
              </p>
            </div>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search member or date..."
              className="rounded-lg border border-slate-300 p-3"
            />
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="p-3">Member</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Check-in</th>
                  <th className="p-3">Check-out</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      Loading attendance records...
                    </td>
                  </tr>
                ) : (
                  <>
                    {filteredRecords.map((record) => (
                      <tr
                        key={record.attendance_id}
                        className="border-b last:border-0"
                      >
                        <td className="p-3 font-medium">
                          {record.member_name}
                        </td>
                        <td className="p-3">
                          {record.attendance_date.slice(0, 10)}
                        </td>
                        <td className="p-3">
                          {formatTime(record.check_in_time)}
                        </td>
                        <td className="p-3">
                          {formatTime(record.check_out_time)}
                        </td>
                        <td className="p-3">
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                            Present
                          </span>
                        </td>
                      </tr>
                    ))}

                    {filteredRecords.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-6 text-center text-slate-500"
                        >
                          No attendance records found.
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-slate-500">
          FitZone · Attendance Management
        </p>
      </div>
    </main>
  );
}
