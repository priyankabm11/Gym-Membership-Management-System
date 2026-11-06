
"use client";

import { useEffect, useState } from "react";

type Member = {
  member_id: number;
  full_name: string;
  email: string;
  phone: string;
  gender: string;
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("Female");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadMembers() {
    try {
      const response = await fetch("/api/members");
      if (!response.ok) throw new Error("Could not load members.");

      const data: Member[] = await response.json();
      setMembers(data);
    } catch {
      setMessage("Could not load members. Please refresh the page.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  async function addMember() {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setMessage("Please fill in all required fields.");
      setMessageType("error");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, gender }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add member.");
      }

      setMessage("Member added successfully!");
      setMessageType("success");

      setName("");
      setEmail("");
      setPhone("");
      setGender("Female");

      await loadMembers();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  const filteredMembers = members.filter(
    (member) =>
      member.full_name.toLowerCase().includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900 md:p-10">
      <div className="mx-auto max-w-7xl">
        <a
          href="/"
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          ← Back to Dashboard
        </a>

        <header className="mt-5">
          <p className="text-sm text-slate-500">Gym Management / Members</p>
          <h1 className="mt-1 text-3xl font-bold">Members Management</h1>
          <p className="mt-2 text-slate-500">
            Add, search, and view registered gym members.
          </p>
        </header>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Add New Member</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm font-medium">
              Full Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 p-3"
                placeholder="Enter full name"
              />
            </label>

            <label className="text-sm font-medium">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 p-3"
                placeholder="Enter email"
              />
            </label>

            <label className="text-sm font-medium">
              Phone
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 p-3"
                placeholder="Enter phone number"
              />
            </label>

            <label className="text-sm font-medium">
              Gender
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 p-3"
              >
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </label>
          </div>

          <button
            onClick={addMember}
            disabled={saving}
            className="mt-5 rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "+ Add Member"}
          </button>

          {message && (
            <p
              className={`mt-4 text-sm font-medium ${
                messageType === "success"
                  ? "text-emerald-700"
                  : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Member Directory</h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredMembers.length} member(s) displayed
              </p>
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="rounded-lg border border-slate-300 p-3"
            />
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-500">
                  <th className="p-3">ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Gender</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center">
                      Loading members...
                    </td>
                  </tr>
                ) : filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <tr
                      key={member.member_id}
                      className="border-b last:border-0 hover:bg-slate-50"
                    >
                      <td className="p-3">{member.member_id}</td>
                      <td className="p-3 font-medium">{member.full_name}</td>
                      <td className="p-3">{member.email}</td>
                      <td className="p-3">{member.phone}</td>
                      <td className="p-3">{member.gender}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      No members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="mt-8 text-center text-xs text-slate-500">
          FitZone Gym Management System · Members Module
        </footer>
      </div>
    </main>
  );
}
