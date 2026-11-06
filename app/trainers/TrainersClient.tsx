"use client";

import { useEffect, useState } from "react";

type Trainer = {
  id: number;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  assignedMembers: number;
  status: string;
};

type MemberOption = {
  id: number;
  name: string;
};

type Assignment = {
  id: number;
  trainerId: number;
  memberId: number;
  trainer: string;
  member: string;
  date: string;
  endDate: string | null;
};

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("Strength Training");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [memberOptions, setMemberOptions] = useState<MemberOption[]>([]);
  const [member, setMember] = useState("");
  const [assignedTrainer, setAssignedTrainer] = useState("");

  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentLoading, setAssignmentLoading] = useState(true);
  const [assignmentSaving, setAssignmentSaving] = useState(false);

  // Load trainers from MySQL
  async function loadTrainers() {
    try {
      setLoading(true);

      const response = await fetch("/api/trainers");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load trainers.");
      }

      const formattedTrainers: Trainer[] = data.map(
        (item: {
          trainer_id: number;
          trainer_name: string;
          specialization: string | null;
          phone: string | null;
          email: string | null;
        }) => ({
          id: item.trainer_id,
          name: item.trainer_name,
          specialization: item.specialization || "Not specified",
          phone: item.phone || "Not provided",
          email: item.email || "",
          assignedMembers: 0,
          status: "Active",
        })
      );

      setTrainers(formattedTrainers);

      if (formattedTrainers.length > 0) {
        setAssignedTrainer((current) =>
          formattedTrainers.some(
            (trainer) => trainer.id.toString() === current
          )
            ? current
            : formattedTrainers[0].id.toString()
        );
      } else {
        setAssignedTrainer("");
      }
    } catch (error) {
      console.error("Error loading trainers:", error);
      setMessage("Could not load trainers. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }

  // Load members from MySQL
  async function loadMembers() {
    try {
      const response = await fetch("/api/members");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load members.");
      }

      const formattedMembers: MemberOption[] = data.map(
        (item: { member_id: number; full_name: string }) => ({
          id: item.member_id,
          name: item.full_name,
        })
      );

      setMemberOptions(formattedMembers);

      setMember((current) =>
        formattedMembers.some((item) => item.id.toString() === current)
          ? current
          : formattedMembers[0]?.id.toString() || ""
      );
    } catch (error) {
      console.error("Error loading members:", error);
      setMessage("Could not load members. Please refresh the page.");
    }
  }

  // Load trainer assignments from MySQL
  async function loadAssignments() {
    try {
      setAssignmentLoading(true);

      const response = await fetch("/api/assignments");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load assignments.");
      }

      const formattedAssignments: Assignment[] = data.map(
        (item: {
          assignment_id: number;
          trainer_id: number;
          trainer: string;
          member_id: number;
          member: string;
          assigned_date: string;
          end_date: string | null;
        }) => ({
          id: item.assignment_id,
          trainerId: item.trainer_id,
          memberId: item.member_id,
          trainer: item.trainer,
          member: item.member,
          date: item.assigned_date,
          endDate: item.end_date,
        })
      );

      setAssignments(formattedAssignments);
    } catch (error) {
      console.error("Error loading assignments:", error);
      setMessage(
        "Could not load trainer assignments. Please refresh the page."
      );
    } finally {
      setAssignmentLoading(false);
    }
  }

  // Load all data when the page opens
  useEffect(() => {
    loadTrainers();
    loadMembers();
    loadAssignments();
  }, []);

  // Add a new trainer
  async function addTrainer() {
    if (!name.trim()) {
      setMessage("Please enter the trainer's name.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/trainers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          specialization,
          phone: phone.trim(),
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add trainer.");
      }

      setName("");
      setPhone("");
      setEmail("");

      await loadTrainers();

      setMessage("Trainer added successfully and saved to MySQL!");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while adding the trainer."
      );
    } finally {
      setSaving(false);
    }
  }

  // Assign a member to a trainer and save it in MySQL
  async function assignMember() {
    const trainer = trainers.find(
      (item) => item.id.toString() === assignedTrainer
    );

    const selectedMember = memberOptions.find(
      (item) => item.id.toString() === member
    );

    if (!trainer) {
      setMessage("Please select a valid trainer.");
      return;
    }

    if (!selectedMember) {
      setMessage("Please select a valid member.");
      return;
    }

    const alreadyAssigned = assignments.some(
      (item) =>
        item.trainerId === trainer.id &&
        item.memberId === selectedMember.id &&
        !item.endDate
    );

    if (alreadyAssigned) {
      setMessage("This member is already assigned to this trainer.");
      return;
    }

    setAssignmentSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trainer_id: trainer.id,
          member_id: selectedMember.id,
          assigned_date: new Date().toISOString().slice(0, 10),
          end_date: null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to assign member.");
      }

      await loadAssignments();

      setMessage(
        `${selectedMember.name} assigned to ${trainer.name} and saved to MySQL!`
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not save the assignment."
      );
    } finally {
      setAssignmentSaving(false);
    }
  }

  // Search trainers by name or specialization
  const filteredTrainers = trainers.filter(
    (trainer) =>
      trainer.name.toLowerCase().includes(search.toLowerCase()) ||
      trainer.specialization.toLowerCase().includes(search.toLowerCase())
  );

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
            Trainers Management
          </h1>

          <p className="mt-2 text-slate-500">
            Manage trainers and assign members to them.
          </p>
        </header>

        {/* Summary cards */}
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Trainers</p>
            <p className="mt-2 text-3xl font-bold">{trainers.length}</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Active Trainers</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {
                trainers.filter((trainer) => trainer.status === "Active")
                  .length
              }
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Assignments</p>
            <p className="mt-2 text-3xl font-bold">
              {assignments.length}
            </p>
          </div>
        </section>

        {/* Add trainer */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Add a Trainer</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm font-medium">
              Trainer name *
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter full name"
                className="mt-2 w-full rounded-lg border border-slate-300 p-3"
              />
            </label>

            <label className="text-sm font-medium">
              Specialization
              <select
                value={specialization}
                onChange={(event) => setSpecialization(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
              >
                <option>Strength Training</option>
                <option>Yoga & Flexibility</option>
                <option>Cardio & Fitness</option>
                <option>Personal Training</option>
                <option>Nutrition & Wellness</option>
              </select>
            </label>

            <label className="text-sm font-medium">
              Phone number
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Enter phone number"
                className="mt-2 w-full rounded-lg border border-slate-300 p-3"
              />
            </label>

            <label className="text-sm font-medium">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter email address"
                className="mt-2 w-full rounded-lg border border-slate-300 p-3"
              />
            </label>
          </div>

          <button
            onClick={addTrainer}
            disabled={saving}
            className="mt-5 rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "+ Add Trainer"}
          </button>
        </section>

        {/* Trainer directory */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Trainer Directory</h2>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search trainers..."
              className="rounded-lg border border-slate-300 p-3"
            />
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="p-3">ID</th>
                  <th className="p-3">Trainer</th>
                  <th className="p-3">Specialization</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Assigned members</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-6 text-center text-slate-500"
                    >
                      Loading trainers...
                    </td>
                  </tr>
                ) : (
                  <>
                    {filteredTrainers.map((trainer) => (
                      <tr
                        key={trainer.id}
                        className="border-b last:border-0"
                      >
                        <td className="p-3">#{trainer.id}</td>
                        <td className="p-3 font-medium">{trainer.name}</td>
                        <td className="p-3">{trainer.specialization}</td>
                        <td className="p-3">{trainer.phone}</td>
                        <td className="p-3">{trainer.email || "—"}</td>

                        <td className="p-3">
                          {
                            assignments.filter(
                              (assignment) =>
                                assignment.trainerId === trainer.id &&
                                !assignment.endDate
                            ).length
                          }
                        </td>

                        <td className="p-3">
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {trainer.status}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {filteredTrainers.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-6 text-center text-slate-500"
                        >
                          {trainers.length === 0
                            ? "No trainers found in the database."
                            : "No trainers match your search."}
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Assign member */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            Assign a Member to a Trainer
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Assignments are saved in MySQL and remain available after
            refreshing the page.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Trainer
              <select
                value={assignedTrainer}
                onChange={(event) => setAssignedTrainer(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
              >
                {trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id.toString()}>
                    {trainer.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium">
              Member
              <select
                value={member}
                onChange={(event) => setMember(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
              >
                {memberOptions.map((item) => (
                  <option key={item.id} value={item.id.toString()}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            onClick={assignMember}
            disabled={
              trainers.length === 0 ||
              memberOptions.length === 0 ||
              assignmentSaving
            }
            className="mt-5 rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {assignmentSaving ? "Saving..." : "Assign Member"}
          </button>

          {message && (
            <p className="mt-4 text-sm font-medium" role="status">
              {message}
            </p>
          )}

          {/* Current assignments */}
          <h3 className="mt-8 text-lg font-bold">Current Assignments</h3>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="p-3">Trainer</th>
                  <th className="p-3">Member</th>
                  <th className="p-3">Assigned date</th>
                </tr>
              </thead>

              <tbody>
                {assignmentLoading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-6 text-center text-slate-500"
                    >
                      Loading assignments...
                    </td>
                  </tr>
                ) : assignments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-6 text-center text-slate-500"
                    >
                      No trainer assignments yet.
                    </td>
                  </tr>
                ) : (
                  assignments.map((assignment) => (
                    <tr
                      key={assignment.id}
                      className="border-b last:border-0"
                    >
                      <td className="p-3">{assignment.trainer}</td>
                      <td className="p-3">{assignment.member}</td>
                      <td className="p-3">{assignment.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-slate-500">
          FitZone · Trainer Management
        </p>
      </div>
    </main>
  );
}