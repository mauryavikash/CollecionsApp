"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, ChevronDown, Copy, Download, Eye, FileText, MoreHorizontal, Search, X } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import Pagination from "@/components/common/Pagination";

const COLUMNS = [
  { key: "invoice", label: "INVOICE #" },
  { key: "date", label: "INVOICE DATE" },
  { key: "due", label: "DUE DATE" },
  { key: "ageDays", label: "AGE (DAYS)" },
  { key: "amountRaw", label: "AMOUNT" },
  { key: "status", label: "STATUS" },
  { key: "paymentDate", label: "PAYMENT DATE" },
];

const STATUS_STYLES = {
  Paid: "bg-green-50 text-green-700",
  Overdue: "bg-red-50 text-red-600",
  Open: "bg-blue-50 text-blue-600",
};

function toExportRows(rows) {
  return rows.map((row) => ({
    "Invoice #": row.invoice,
    "Invoice Date": row.date,
    "Due Date": row.due,
    "Age (Days)": row.ageDays,
    Amount: row.amount,
    Status: row.status,
    "Payment Date": row.paymentDate || "",
  }));
}

export function exportTransactions(rows, fileBase, format = "xlsx") {
  const sheet = XLSX.utils.json_to_sheet(toExportRows(rows));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Transactions");
  XLSX.writeFile(workbook, `${fileBase}.${format}`, { bookType: format });
}

function DetailModal({ row, onClose }) {
  if (!row) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/30 p-4" role="dialog" aria-modal="true" aria-label={`Invoice ${row.invoice}`} onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-slate-800">Invoice {row.invoice}</h3>
          <button type="button" aria-label="Close" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <dl className="text-[12px]">
          {toExportRows([row]).flatMap((item) =>
            Object.entries(item).map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-slate-100 py-2 last:border-b-0">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-800">{value === "" ? "–" : value}</dd>
              </div>
            )),
          )}
        </dl>
      </div>
    </div>
  );
}

export default function Transactions({ transactions = [], accountId }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "date", direction: "desc" });
  const [selected, setSelected] = useState(() => new Set());
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  const [menuRow, setMenuRow] = useState(null);
  const [detailRow, setDetailRow] = useState(null);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? transactions.filter((row) =>
          [row.invoice, row.date, row.due, row.amount, row.status, row.paymentDate].some((value) => String(value).toLowerCase().includes(needle)),
        )
      : transactions;
    const direction = sort.direction === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const left = a[sort.key];
      const right = b[sort.key];
      if (typeof left === "number" && typeof right === "number") return (left - right) * direction;
      return String(left).localeCompare(String(right)) * direction;
    });
  }, [transactions, query, sort]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const visible = rows.slice(start, start + pageSize);
  const allVisibleSelected = visible.length > 0 && visible.every((row) => selected.has(row.key));

  const toggleSort = (key) =>
    setSort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));

  const toggleRow = (key) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const toggleAll = () =>
    setSelected((current) => {
      const next = new Set(current);
      visible.forEach((row) => (allVisibleSelected ? next.delete(row.key) : next.add(row.key)));
      return next;
    });

  const runExport = (format) => {
    setExportOpen(false);
    const exportRows = selected.size ? rows.filter((row) => selected.has(row.key)) : rows;
    exportTransactions(exportRows, `account-${accountId}-transactions`, format);
  };

  const copyInvoice = async (row) => {
    setMenuRow(null);
    try {
      await navigator.clipboard.writeText(row.invoice);
      toast.success(`Copied invoice ${row.invoice}`);
    } catch {
      toast.error("Unable to copy to clipboard");
    }
  };

  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white shadow-[0_2px_6px_rgba(38,82,144,.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-[15px] font-bold text-slate-800">Open Invoices &amp; Transactions</h2>
            <p className="text-[12px] text-slate-500">View all open invoices, payments and adjustments for this account</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportOpen((open) => !open)}
              aria-expanded={exportOpen}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-semibold text-blue-700 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" /> Export {selected.size ? `(${selected.size})` : ""} <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {exportOpen && (
              <ul className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 text-[12px] shadow-lg">
                {[
                  { format: "xlsx", label: "Excel (.xlsx)" },
                  { format: "csv", label: "CSV (.csv)" },
                ].map((option) => (
                  <li key={option.format}>
                    <button type="button" onClick={() => runExport(option.format)} className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50">
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <label className="relative">
            <span className="sr-only">Search transactions</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search by invoice #, date or amount..."
              className="h-9 w-full rounded-lg border sm:w-[280px] border-slate-200 bg-white pl-9 pr-3 text-[12px] outline-none focus:border-blue-500"
            />
          </label>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-[12px]">
          <thead className="border-y border-slate-200 bg-slate-50 text-[11px] text-slate-500">
            <tr>
              <th className="w-10 px-4 py-2.5">
                <input type="checkbox" aria-label="Select all transactions" checked={allVisibleSelected} onChange={toggleAll} className="h-3.5 w-3.5 accent-blue-600" />
              </th>
              {COLUMNS.map((column) => (
                <th key={column.key} className="px-3 py-2.5 font-semibold">
                  <button type="button" onClick={() => toggleSort(column.key)} className="inline-flex items-center gap-1 hover:text-slate-700">
                    {column.label}
                    <ArrowDownUp className={`h-3 w-3 ${sort.key === column.key ? "text-blue-600" : "text-slate-400"}`} />
                  </button>
                </th>
              ))}
              <th className="px-3 py-2.5 text-center font-semibold">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.key} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2.5">
                  <input type="checkbox" aria-label={`Select invoice ${row.invoice}`} checked={selected.has(row.key)} onChange={() => toggleRow(row.key)} className="h-3.5 w-3.5 accent-blue-600" />
                </td>
                <td className="px-3 py-2.5">
                  <button type="button" onClick={() => setDetailRow(row)} className="font-semibold text-blue-600 underline-offset-2 hover:underline">
                    {row.invoice}
                  </button>
                </td>
                <td className="px-3 py-2.5 text-slate-700">{row.date || "–"}</td>
                <td className="px-3 py-2.5 text-slate-500">{row.due || "–"}</td>
                <td className={`px-3 py-2.5 font-semibold ${row.ageDays > 0 ? "text-red-500" : "text-slate-700"}`}>{row.ageDays}</td>
                <td className="px-3 py-2.5 font-medium text-slate-800">{row.amount}</td>
                <td className="px-3 py-2.5">
                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[row.status] ?? "bg-slate-100 text-slate-600"}`}>
                    ● {row.status}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-slate-600">{row.paymentDate || "–"}</td>
                <td className="px-3 py-2.5">
                  <div className="relative flex items-center justify-center gap-1.5">
                    <button type="button" title="View invoice" aria-label={`View invoice ${row.invoice}`} onClick={() => setDetailRow(row)} className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 text-blue-600 hover:bg-blue-50">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Download invoice line"
                      aria-label={`Download invoice ${row.invoice}`}
                      onClick={() => exportTransactions([row], `invoice-${row.invoice}`, "csv")}
                      className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 text-blue-600 hover:bg-blue-50"
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="More actions"
                      aria-label={`More actions for invoice ${row.invoice}`}
                      onClick={() => setMenuRow((current) => (current === row.key ? null : row.key))}
                      className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                    {menuRow === row.key && (
                      <div className="absolute right-0 top-8 z-20 w-40 rounded-lg border border-slate-200 bg-white py-1 text-[12px] shadow-lg">
                        <button type="button" onClick={() => copyInvoice(row)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50">
                          <Copy className="h-3.5 w-3.5" /> Copy invoice #
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={COLUMNS.length + 2} className="py-10 text-center text-slate-500">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-[12px] text-slate-500">
        <span>
          Showing {rows.length ? start + 1 : 0}-{Math.min(start + pageSize, rows.length)} of {rows.length} transactions
        </span>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            Rows per page
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[12px] text-slate-700"
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

      <DetailModal row={detailRow} onClose={() => setDetailRow(null)} />
    </section>
  );
}
