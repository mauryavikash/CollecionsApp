"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownUp, ChevronDown, Copy, ExternalLink, FileText, Filter, MoreVertical, NotebookText, Phone, Search } from "lucide-react";
import { toast } from "sonner";
import Pagination from "@/components/common/Pagination";
import { daysBetween, getAvatarColor, getInitials, parseISODate, startOfToday } from "@/utils/helpers";

const RISK_STYLES = {
  Critical: "bg-red-100 text-red-600",
  High: "bg-orange-100 text-orange-600",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-green-100 text-green-700",
};
const PTP_STYLES = {
  Active: "bg-blue-100 text-blue-700",
  Broken: "bg-red-100 text-red-600",
  Partial: "bg-violet-100 text-violet-700",
  Fulfilled: "bg-green-100 text-green-700",
  None: "bg-slate-100 text-slate-600",
};
const RISK_ORDER = { Critical: 4, High: 3, Medium: 2, Low: 1 };
const BUCKET_ORDER = { "181+ days": 5, "91-180 days": 4, "61-90 days": 3, "31-60 days": 2, "1-30 days": 1 };

const COLUMNS = [
  { key: "rank", label: "#" },
  { key: "customer", label: "CUSTOMER" },
  { key: "overdueRaw", label: "OVERDUE AMOUNT" },
  { key: "dpd", label: "DPD" },
  { key: "bucketOrder", label: "AGING BUCKET" },
  { key: "riskOrder", label: "RISK" },
  { key: "ptp", label: "PTP STATUS" },
  { key: "date", label: "PTP DATE" },
  { key: "owner", label: "COLLECTOR" },
  { key: "noteCount", label: "NOTES" },
];

function ptpDue(account, today) {
  if (account.ptp === "Fulfilled") return null;
  const days = daysBetween(today, parseISODate(account.date));
  if (days === null) return null;
  if (days > 0) return { text: `${days} day${days === 1 ? "" : "s"} left`, className: "text-green-600" };
  if (days === 0) return { text: "Due today", className: "text-orange-500" };
  return { text: `${-days} day${days === -1 ? "" : "s"} over`, className: "text-red-500" };
}

function FilterSelect({ value, onChange, allLabel, options, icon }) {
  return (
    <label className="relative inline-flex">
      <span className="sr-only">{allLabel}</span>
      {icon && <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-10 min-w-[150px] appearance-none rounded-lg border border-slate-200 bg-white ${icon ? "pl-9" : "pl-3"} pr-9 text-[13px] font-medium text-slate-700 outline-none focus:border-blue-500`}
      >
        <option value="All">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
    </label>
  );
}

function RowMenu({ account, onClose, onOpen }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const copy = async () => {
    onClose();
    try {
      await navigator.clipboard.writeText(String(account.id));
      toast.success(`Copied account #${account.id}`);
    } catch {
      toast.error("Unable to copy to clipboard");
    }
  };

  return (
    <div ref={ref} className="absolute right-0 top-9 z-20 w-44 rounded-lg border border-slate-200 bg-white py-1 text-[12px] shadow-lg">
      <button type="button" onClick={() => onOpen("")} className="flex w-full items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50">
        <ExternalLink className="h-3.5 w-3.5" /> Open Account 360
      </button>
      <button type="button" onClick={copy} className="flex w-full items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50">
        <Copy className="h-3.5 w-3.5" /> Copy account #
      </button>
    </div>
  );
}

export default function WorkbenchTable({ accounts: source = [] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [bucket, setBucket] = useState("All");
  const [risk, setRisk] = useState("All");
  const [ptp, setPtp] = useState("All");
  const [sort, setSort] = useState({ key: "rank", direction: "asc" });
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());
  const [owners, setOwners] = useState({});
  const [menuFor, setMenuFor] = useState(null);
  const today = useMemo(() => startOfToday(), []);

  const accounts = useMemo(() => {
    const totalOverdue = source.reduce((sum, account) => sum + Math.max(account.overdueRaw, 0), 0);
    return source.map((account) => ({
      ...account,
      owner: owners[account.id] ?? account.owner,
      shareOfAr: totalOverdue ? `${((account.overdueRaw / totalOverdue) * 100).toFixed(1)}% of AR` : account.share,
    }));
  }, [source, owners]);

  const options = useMemo(() => {
    const unique = (key, order) =>
      [...new Set(accounts.map((account) => account[key]).filter(Boolean))].sort((a, b) => (order ? (order[b] ?? 0) - (order[a] ?? 0) : a.localeCompare(b)));
    return { bucket: unique("bucket", BUCKET_ORDER), risk: unique("risk", RISK_ORDER), ptp: unique("ptp") };
  }, [accounts]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const direction = sort.direction === "asc" ? 1 : -1;
    return accounts
      .filter(
        (account) =>
          (!needle || `${account.customer} ${account.id} ${account.owner}`.toLowerCase().includes(needle)) &&
          (bucket === "All" || account.bucket === bucket) &&
          (risk === "All" || account.risk === risk) &&
          (ptp === "All" || account.ptp === ptp),
      )
      .sort((a, b) => {
        const left = a[sort.key];
        const right = b[sort.key];
        if (typeof left === "number" && typeof right === "number") return (left - right) * direction;
        return String(left ?? "").localeCompare(String(right ?? "")) * direction;
      });
  }, [accounts, query, bucket, risk, ptp, sort]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const visible = rows.slice(start, start + pageSize);
  const allVisibleSelected = visible.length > 0 && visible.every((account) => selected.has(account.id));

  const withReset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const toggleSort = (key) =>
    setSort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));

  const toggleRow = (id) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected((current) => {
      const next = new Set(current);
      visible.forEach((account) => (allVisibleSelected ? next.delete(account.id) : next.add(account.id)));
      return next;
    });

  const openAccount = (id, tab = "") => router.push(`/account?id=${encodeURIComponent(id)}${tab ? `&tab=${tab}` : ""}`);

  const reassign = (account, owner) => {
    setOwners((current) => ({ ...current, [account.id]: owner }));
    toast.info(`${account.customer} reassigned to ${owner} for this session (not saved to the server).`);
  };

  return (
    <>
      <section className="mt-4 flex flex-wrap items-center gap-3">
        <label className="relative w-full min-w-0 flex-1 sm:min-w-[280px]">
          <span className="sr-only">Search accounts</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(event) => withReset(setQuery)(event.target.value)}
            placeholder="Search by customer, account #, or collector..."
            className="h-10 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-[13px] outline-none focus:border-blue-500"
          />
        </label>
        <FilterSelect value={bucket} onChange={withReset(setBucket)} allLabel="All Customers" options={options.bucket} icon />
        <FilterSelect value={risk} onChange={withReset(setRisk)} allLabel="All Risk" options={options.risk} />
        <FilterSelect value={ptp} onChange={withReset(setPtp)} allLabel="All PTP Status" options={options.ptp} />
        <span className="text-[13px] text-slate-600">{rows.length} accounts</span>
      </section>

      <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_6px_rgba(38,82,144,.08)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" aria-label="Select all accounts on this page" checked={allVisibleSelected} onChange={toggleAll} className="h-4 w-4 accent-blue-600" />
                </th>
                {COLUMNS.map((column) => (
                  <th key={column.key} className="whitespace-nowrap px-3 py-3">
                    <button type="button" onClick={() => toggleSort(column.key)} className="inline-flex items-center gap-1 hover:text-slate-800">
                      {column.label}
                      <ArrowDownUp className={`h-3 w-3 ${sort.key === column.key ? "text-blue-600" : "text-slate-400"}`} />
                    </button>
                  </th>
                ))}
                <th className="px-3 py-3">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((account) => {
                const due = ptpDue(account, today);
                const collectors = account.collectors?.length ? account.collectors : [account.owner];
                return (
                  <tr key={account.id} className="border-b border-slate-100 text-[13px] hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <input type="checkbox" aria-label={`Select ${account.customer}`} checked={selected.has(account.id)} onChange={() => toggleRow(account.id)} className="h-4 w-4 accent-blue-600" />
                    </td>
                    <td className="px-3 py-3 text-slate-700">#{account.rank}</td>
                    <td className="px-3 py-3">
                      <button type="button" onClick={() => openAccount(account.id)} className="block text-left font-semibold text-blue-600 hover:underline">
                        {account.customer}
                      </button>
                      <span className="text-[12px] text-slate-500">{account.id}</span>
                    </td>
                    <td className="px-3 py-3">
                      <b className="block text-red-500">{account.overdue}</b>
                      <span className="text-[12px] text-slate-500">{account.shareOfAr}</span>
                    </td>
                    <td className="px-3 py-3 font-semibold text-red-500">{account.dpd}</td>
                    <td className="px-3 py-3 text-slate-700">{account.bucket}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex min-w-[60px] justify-center rounded-md px-2 py-1 text-[12px] font-semibold ${RISK_STYLES[account.risk] ?? "bg-slate-100 text-slate-600"}`}>
                        {account.risk}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex min-w-[64px] justify-center rounded-md px-2 py-1 text-[12px] font-semibold ${PTP_STYLES[account.ptp] ?? PTP_STYLES.None}`}>
                        {account.ptp}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span className="block text-slate-700">{account.date || "-"}</span>
                      {due && <span className={`text-[12px] font-semibold ${due.className}`}>{due.text}</span>}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: getAvatarColor(account.owner) }}>
                          {getInitials(account.owner)}
                        </span>
                        <label className="relative inline-flex items-center">
                          <span className="sr-only">Assigned collector for {account.customer}</span>
                          <select
                            value={account.owner}
                            onChange={(event) => reassign(account, event.target.value)}
                            className="appearance-none bg-transparent pr-6 text-[13px] font-medium text-slate-800 outline-none"
                          >
                            {[...new Set([account.owner, ...collectors])].map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-slate-500" />
                        </label>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => openAccount(account.id, "notes")}
                        title={account.note || "No notes"}
                        className="inline-flex items-center gap-1.5 text-slate-700 hover:text-blue-600"
                      >
                        <NotebookText className="h-4 w-4" /> {account.noteCount}
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <div className="relative flex items-center gap-1.5">
                        <button type="button" title="View transactions" aria-label={`View transactions for ${account.customer}`} onClick={() => openAccount(account.id, "transactions")} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50">
                          <FileText className="h-4 w-4" />
                        </button>
                        <button type="button" title="Communications" aria-label={`Communications for ${account.customer}`} onClick={() => openAccount(account.id, "communications")} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50">
                          <Phone className="h-4 w-4" />
                        </button>
                        <button type="button" title="More actions" aria-label={`More actions for ${account.customer}`} onClick={() => setMenuFor((current) => (current === account.id ? null : account.id))} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {menuFor === account.id && <RowMenu account={account} onClose={() => setMenuFor(null)} onOpen={(tab) => openAccount(account.id, tab)} />}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr>
                  <td colSpan={COLUMNS.length + 2} className="py-10 text-center text-[13px] text-slate-500">
                    No accounts match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-[13px] text-slate-600">
          <span>
            Showing {rows.length ? start + 1 : 0}-{Math.min(start + pageSize, rows.length)} of {rows.length} accounts
            {selected.size > 0 && <span className="ml-2 font-semibold text-blue-600">({selected.size} selected)</span>}
          </span>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              Rows per page
              <select
                value={pageSize}
                onChange={(event) => withReset(setPageSize)(Number(event.target.value))}
                className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-[13px] text-slate-700"
              >
                {[10, 25, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      </section>
    </>
  );
}
