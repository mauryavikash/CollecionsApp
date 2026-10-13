"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {ChevronDown,FilePenLine,Filter,Info,Plus,Search,} from "lucide-react";
import {addNote,updateNote,deleteNote,} from "@/app/lib/api";
const riskStyles = {
  High: "bg-orange-100 text-orange-600",
  Medium: "bg-amber-100 text-amber-600",
  Low: "bg-emerald-50 text-emerald-600",
  Critical: "bg-rose-100 text-rose-500",
};
const ptpStyles = {
  Broken: "bg-rose-100 text-rose-500",
  Active: "bg-blue-100 text-blue-600",
  "Due Soon": "bg-amber-100 text-amber-600",
};

function MiniSelect({ value, onChange, options, filter }) {
  return (
    <label className="relative">
      <span className="sr-only">Filter accounts</span>
      {filter && (
        <Filter className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
      )}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-[26px] appearance-none rounded-md border border-slate-200 bg-white ${filter ? "pl-6" : "pl-2"} pr-6 text-[9px] text-slate-600 outline-none focus:border-blue-500`}
      >
        <option>All</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
    </label>
  );
}

function AccountRow({ account }) {
  const [showNotes, setShowNotes] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [noteText, setNoteText] = useState(account.note || "");
  const [newNote, setNewNote] = useState("");
  const router = useRouter();

const handleAddNote = async () => {
  try {
    const payload = {
      customer_id: account.id,
      note: newNote,
    };

    const res = await addNote(payload);

    console.log("Note Added", res);

    setShowAddModal(false);
    setNewNote("");

    // alert("Note Added Successfully");
  } catch (error) {
    console.error(error);
    // alert("Failed to add note");
  }
};

const handleEditNote = async () => {
  try {
    const payload = {
      note_id : account.id,
      note: noteText,
    };

    await updateNote(account.id, payload);

    setEditing(false);
    alert("Note Updated Successfully");
  } catch (error) {
    console.error(error);
    alert("Failed to update note");
  }
};
const handleDeleteNote = async () => {
  try {
    const payload = {
      note_id : account.id,
      note: noteText,
    };
    await deleteNote(account.id, payload);

    alert("Note Deleted Successfully");
  } catch (error) {
    console.error(error);
    alert("Failed to delete note");
  }
};
  return (
    <>
      <tr className="border-b border-slate-200 text-[10px] hover:bg-slate-50">
        <td className="w-[68px] px-3 py-3">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <input
              aria-label={`Select ${account.customer}`}
              type="checkbox"
              className="h-3 w-3 shrink-0 accent-blue-600"
            />
            <span className="text-slate-500">#{account.rank}</span>
          </div>
        </td>

        <td className="px-3 py-3">
          <button
            type="button"
            onClick={() => {
                    router.push(`/account?id=${account.id}`);
                  }}
            className="block font-bold text-[#2872e0] cursor-pointer"
          >
            {account.customer}
          </button>
          <small className="text-[8px] text-slate-400">{account.id}</small>
        </td>

        <td className="px-3 py-3">
          <b className="block text-[#f04e55]">{account.overdue}</b>
          <small className="text-[8px] text-slate-400">{account.share}</small>
        </td>

        <td className="px-3 py-3 font-bold text-[#f04e55]">
          {account.dpd}
        </td>

        <td className="px-3 py-3">{account.bucket}</td>

        <td className="px-3 py-3">
          <span
            className={`inline-flex min-w-[46px] justify-center rounded-md px-2 py-1 text-[8px] font-semibold ${
              riskStyles[account.risk]
            }`}
          >
            {account.risk}
          </span>
        </td>

        <td className="px-3 py-3">
          <span
            className={`inline-flex min-w-[54px] justify-center rounded-md px-2 py-1 text-[8px] font-semibold ${
              ptpStyles[account.ptp]
            }`}
          >
            {account.ptp}
          </span>
        </td>

        <td className="px-3 py-3">{account.date}</td>

        <td className="px-3 py-3 whitespace-nowrap">
          <b
            className="mr-1 inline-grid h-5 w-5 place-items-center rounded-full text-[7px] text-white"
            style={{
              backgroundColor: account.avatarColor || "#2865dc",
            }}
          >
            {account.initials}
          </b>

          {account.owner}

          <ChevronDown className="ml-1 inline h-3 w-3 text-blue-500" />
        </td>

        <td className="px-3 py-3 whitespace-nowrap">
          <button
            type="button"
            onClick={() => setShowNotes((prev) => !prev)}
            className="block text-[8px] font-semibold text-blue-600"
          >
            <FilePenLine className="mr-1 inline h-3 w-3" />
            {showNotes ? "Hide Notes" : "View Notes"}
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="mt-1 text-[8px] font-semibold text-blue-600"
          >
            <Plus className="mr-1 inline h-3 w-3" />
            Add Note
          </button>
        </td>
      </tr>

      {showNotes && account.note && (
        <tr className="border-b border-slate-200 bg-slate-50">
          <td colSpan={10} className="px-9 py-2">
            {editing ? (
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full rounded border border-slate-300 p-2 text-[10px]"
                />
              ) : (
                <p className="text-[10px] text-slate-600">
                  <Info className="mr-1 inline h-3.5 w-3.5 text-slate-400" />
                  {noteText}
                </p>
              )}


            <div className="mt-1 flex items-center justify-between">
              <p className="space-x-3 text-[8px] text-slate-400">
                <span>Last contact: {account.lastContact}</span>
                <span>Broken PTPs: 3</span>
                <span>Fulfilled PTPs: 1</span>
              </p>

              <span className="space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    if (editing) {
                      handleEditNote();
                    } else {
                      setEditing(true);
                    }
                  }}
                  className="rounded bg-white px-2 py-1 text-[8px] text-blue-600"
                >
                  {editing ? "Save Note" : "Edit Note"}
                </button>

                <button
                  type="button"
                  onClick={handleDeleteNote}
                  className="rounded bg-white px-2 py-1 text-[8px] text-rose-500"
                >
                  Delete Note
                </button>
              </span>
            </div>
          </td>
        </tr>
      )}

      {showAddModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="w-[500px] rounded-lg bg-white p-5 shadow-xl">
      <h2 className="mb-4 text-lg font-semibold">
        Add Note
      </h2>

      <textarea
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        placeholder="Enter note..."
        rows={5}
        className="w-full rounded border border-slate-300 p-2 text-sm outline-none focus:border-blue-500"
      />

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => {
            setShowAddModal(false);
            setNewNote("");
          }}
          className="rounded border border-slate-300 px-4 py-2 text-sm"
        >
          Cancel
        </button>

        <button
          onClick={handleAddNote}
          disabled={!newNote.trim()}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
}
export default function WorkbenchTable({ accounts: accountData = [] }) {
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState("All");
  const [ptp, setPtp] = useState("All");
  const [bucket, setBucket] = useState("All");
  const accounts = useMemo(
    () =>
      accountData.filter(
        (account) =>
          `${account.customer} ${account.id}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (risk === "All" || account.risk === risk) &&
          (ptp === "All" || account.ptp === ptp) &&
          (bucket === "All" || account.bucket === bucket),
      ),
    [accountData, bucket, ptp, query, risk],
  );

  return (
    <>
      <section className="mt-[18px] flex flex-wrap items-center gap-2">
        <label className="relative min-w-[280px] flex-1">
          <span className="sr-only">Search accounts</span>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by customer or account #..."
            className="h-[26px] w-full rounded-md border border-slate-200 bg-white pl-7 text-[10px] outline-none"
          />
        </label>
        <MiniSelect
          value={risk}
          onChange={setRisk}
          options={["High", "Medium", "Low"]}
          filter
        />
        <MiniSelect
          value={ptp}
          onChange={setPtp}
          options={["Active", "Broken", "Due Soon"]}
        />
        <MiniSelect
          value={bucket}
          onChange={setBucket}
          options={["181+ days", "91-180 days", "61-90 days"]}
        />
        <span className="text-[10px] text-slate-500">
          {accounts.length} accounts
        </span>
      </section>
      <section className="mt-[18px] overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[990px] border-collapse text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr className="text-[8px] font-bold text-slate-500">
                <th className="w-[68px] px-3 py-2">
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <input
                      aria-label="Select all"
                      type="checkbox"
                      className="h-3 w-3 shrink-0 accent-blue-600"
                    />
                    <span># ↑</span>
                  </div>
                </th>
                {[
                  "CUSTOMER",
                  "OVERDUE AMOUNT",
                  "DPD",
                  "AGING BUCKET",
                  "RISK",
                  "PTP STATUS",
                  "PTP DATE",
                  "COLLECTOR",
                  "NOTES",
                ].map((heading) => (
                  <th key={heading} className="px-3 py-2">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <AccountRow key={account.id} account={account} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
