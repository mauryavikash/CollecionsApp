"use client";
import { toast } from "sonner";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  FilePenLine,
  Filter,
  Info,
  Plus,
  Search,
} from "lucide-react";
import { addNote, updateNote, deleteNote } from "@/app/lib/api";
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
        className={`h-[26px] appearance-none rounded-md border border-slate-200 bg-white ${filter ? "pl-6" : "pl-2"} pr-6 text-[12px] text-slate-600 outline-none focus:border-blue-500`}
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
  const [selectedCollector, setSelectedCollector] = useState(
    account.owner || "",
  );
  const router = useRouter();

  const handleAddNote = async () => {
    const toastId = toast.loading("Adding note...");

    try {
      const payload = {
        customer_id: account.id,
        note: newNote,
      };

      await addNote(payload);

      toast.success("Note Added Successfully", {
        id: toastId,
      });

      setShowAddModal(false);
      setNewNote("");
    } catch (error) {
      console.error(error);

      toast.error(error?.response?.data?.message || "Failed to add note", {
        id: toastId,
      });

      // Close popup on failure also
      setShowAddModal(false);
      setNewNote("");
    }
  };
  const handleEditNote = async () => {
    const toastId = toast.loading("Updating note...");

    try {
      const payload = {
        note_id: account.id,
        note: noteText,
      };

      await updateNote(account.id, payload);

      setEditing(false);

      toast.success("Note Updated Successfully", {
        id: toastId,
      });
    } catch (error) {
      console.error(error);

      toast.error(error?.response?.data?.message || "Failed to update note", {
        id: toastId,
      });
    }
  };

  const handleDeleteNote = async () => {
    const toastId = toast.loading("Deleting note...");
    try {
      const payload = {
        note_id: account.id,
        note: noteText,
      };

      await deleteNote(account.id, payload);

      toast.success("Note Deleted Successfully", {
        id: toastId,
      });
    } catch (error) {
      console.error(error);

      toast.error(error?.response?.data?.message || "Failed to delete note", {
        id: toastId,
      });
    }
  };
  return (
    <>
      <tr className="border-b border-slate-200 text-[12px] hover:bg-slate-50">
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
          <small className="text-[12px] text-slate-400">{account.id}</small>
        </td>

        <td className="px-3 py-3">
          <b className="block text-[#f04e55]">{account.overdue}</b>
          <small className="text-[12px] text-slate-400">{account.share}</small>
        </td>

        <td className="px-3 py-3 font-bold text-[#f04e55]">{account.dpd}</td>

        <td className="px-3 py-3">{account.bucket}</td>

        <td className="px-3 py-3">
          <span
            className={`inline-flex min-w-[46px] justify-center rounded-md px-2 py-1 text-[12px] font-semibold ${
              riskStyles[account.risk]
            }`}
          >
            {account.risk}
          </span>
        </td>

        <td className="px-3 py-3">
          <span
            className={`inline-flex min-w-[54px] justify-center rounded-md px-2 py-1 text-[12px] font-semibold ${
              ptpStyles[account.ptp]
            }`}
          >
            {account.ptp}
          </span>
        </td>

        <td className="px-3 py-3">{account.date}</td>

        {/* <td className="px-3 py-3 whitespace-nowrap">
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
        </td> */}
        <td className="px-3 py-3 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <b
              className="inline-grid h-5 w-5 place-items-center rounded-full text-[7px] text-white"
              style={{
                backgroundColor: account.avatarColor || "#2865dc",
              }}
            >
              {selectedCollector
                ?.split(" ")
                ?.map((n) => n[0])
                ?.join("")
                ?.toUpperCase()
                ?.slice(0, 2)}
            </b>

            <select
              value={selectedCollector}
              onChange={(e) => setSelectedCollector(e.target.value)}
              className="border-0 bg-transparent text-[12px] font-medium text-slate-700 outline-none"
            >
              {(account.collectors || []).map((collector) => (
                <option key={collector} value={collector}>
                  {collector}
                </option>
              ))}
            </select>
          </div>
        </td>

        <td className="px-3 py-3 whitespace-nowrap">
          <button
            type="button"
            onClick={() => setShowNotes((prev) => !prev)}
            className="block text-[12px] font-semibold text-blue-600"
          >
            <FilePenLine className="mr-1 inline h-3 w-3" />
            {showNotes ? "Hide Notes" : "View Notes"}
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="mt-1 text-[12px] font-semibold text-blue-600"
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
                className="w-full rounded border border-slate-300 p-2 text-[12px]"
              />
            ) : (
              <p className="text-[12px] text-slate-600">
                <Info className="mr-1 inline h-3.5 w-3.5 text-slate-400" />
                {noteText}
              </p>
            )}

            <div className="mt-1 flex items-center justify-between">
              <p className="space-x-3 text-[12px] text-slate-400">
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
                  className="rounded bg-white px-2 py-1 text-[12px] text-blue-600"
                >
                  {editing ? "Save Note" : "Edit Note"}
                </button>

                <button
                  type="button"
                  onClick={handleDeleteNote}
                  className="rounded bg-white px-2 py-1 text-[12px] text-rose-500"
                >
                  Delete Note
                </button>
              </span>
            </div>
          </td>
        </tr>
      )}

      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => {
            setShowAddModal(false);
            setNewNote("");
          }}
        >
          <div
            className="w-[500px] rounded-lg bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-semibold">Add Note</h2>

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
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
  const totalPages = Math.ceil(accounts.length / itemsPerPage);

  const paginatedAccounts = accounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
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
            className="h-[26px] w-full rounded-md border border-slate-200 bg-white pl-7 text-[12px] outline-none"
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
        <span className="text-[12px] text-slate-500">
          {accounts.length} accounts
        </span>
      </section>
      <section className="mt-[18px] overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[990px] border-collapse text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr className="text-[12px] font-bold text-slate-500">
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
              {paginatedAccounts.map((account) => (
                <AccountRow key={account.id} account={account} />
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3">
            {/* Left Side */}
            <div className="text-[13px] text-slate-500">
              Showing{" "}
              {accounts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
              -{Math.min(currentPage * itemsPerPage, accounts.length)} of{" "}
              {accounts.length} accounts
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-slate-500">Rows per page</span>

              <select
                value={itemsPerPage}
                className="h-8 rounded-md border border-slate-200 px-2 text-[13px]"
                disabled
              >
                <option>10</option>
              </select>

              {/* Previous */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ‹
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const page = i + 1;

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 rounded-md text-sm font-medium ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                {totalPages > 5 && (
                  <>
                    <span className="px-1 text-slate-400">...</span>

                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`h-8 w-8 rounded-md text-sm font-medium ${
                        currentPage === totalPages
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              {/* Next */}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
