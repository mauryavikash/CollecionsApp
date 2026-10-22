"use client";

import { useState } from "react";
import { getAvatarColor, getInitials } from "@/utils/helpers";

// Columns come from the backend ptpHistoryMeta.columns; this is the fallback.
const DEFAULT_COLUMNS = [
  { key: "#", label: "#" },
  { key: "status", label: "Status" },
  { key: "promiseAmount", label: "Promise Amount" },
  { key: "promiseDate", label: "Promise Date" },
  { key: "dueDate", label: "Due Date" },
  { key: "actualPayment", label: "Actual Payment" },
  { key: "daysVariance", label: "Days Variance" },
  { key: "createdBy", label: "Created By" },
  { key: "notes", label: "Notes" },
];

const STATUS_CLASSES = {
  partial: "bg-orange-100 text-orange-600",
  active: "bg-blue-100 text-blue-600",
  open: "bg-blue-100 text-blue-600",
  broken: "bg-red-100 text-red-600",
  fulfilled: "bg-green-100 text-green-600",
};

function normalizeRow(item, index) {
  const by = item?.createdBy?.name ?? item?.collector ?? "";
  return {
    index: item?.["#"] ?? index + 1,
    status: item?.status ?? "-",
    promiseAmount: item?.promiseAmount ?? item?.amount ?? "-",
    promiseDate: item?.promiseDate ?? item?.promise ?? "",
    dueDate: item?.dueDate ?? "",
    actualPayment: item?.actualPayment ?? "-",
    daysVariance: item?.daysVariance ?? "-",
    daysVarianceColor: item?.daysVarianceColor,
    createdBy: by,
    createdByInitials: item?.createdBy?.initials ?? getInitials(by),
    notes: item?.notes ?? item?.note ?? "",
  };
}

function renderCell(key, row) {
  switch (key) {
    case "#":
      return <span className="text-slate-500">{row.index}</span>;
    case "status":
      return (
        <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${STATUS_CLASSES[String(row.status).toLowerCase()] ?? "bg-slate-100 text-slate-600"}`}>
          {row.status}
        </span>
      );
    case "promiseAmount":
      return <b className="text-slate-800">{row.promiseAmount}</b>;
    case "daysVariance":
      return (
        <span className="font-semibold" style={row.daysVarianceColor ? { color: row.daysVarianceColor } : undefined}>
          {row.daysVariance}
        </span>
      );
    case "createdBy":
      return row.createdBy ? (
        <span className="inline-flex items-center gap-2 whitespace-nowrap">
          <span className="grid h-6 w-6 place-items-center rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: getAvatarColor(row.createdBy) }}>
            {row.createdByInitials}
          </span>
          {row.createdBy}
        </span>
      ) : (
        "-"
      );
    case "notes":
      return (
        <span className="line-clamp-2 max-w-[260px] text-slate-600" title={row.notes}>
          {row.notes || "-"}
        </span>
      );
    default:
      return row[key] || "-";
  }
}

export default function PTPhistory({ history = [], meta = {} }) {
  const pageSizeOptions = meta.rowsPerPageOptions?.length ? meta.rowsPerPageOptions : [10, 25, 50];
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [page, setPage] = useState(1);
  const columns = meta.columns?.length ? meta.columns : DEFAULT_COLUMNS;
  const rows = history.map(normalizeRow);
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const visible = rows.slice(start, start + pageSize);

  return (
    <section className="mt-4 min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_2px_6px_rgba(38,82,144,.08)]">
      <div className="mb-3">
        <h2 className="text-[15px] font-bold text-slate-800">{meta.title ?? "PTP History"}</h2>
        <p className="text-[12px] text-slate-500">{meta.subtitle ?? "Customer commitments and payment performance"}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-[12px]">
          <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="whitespace-nowrap px-3 py-2 font-semibold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length ? (
              visible.map((row) => (
                <tr key={`${row.index}-${row.promiseDate}`} className="border-t border-slate-100">
                  {columns.map((column) => (
                    <td key={column.key} className="px-3 py-2.5 align-middle text-slate-700">
                      {renderCell(column.key, row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-3 py-10 text-center text-slate-500">
                  No promises to pay recorded for this account.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[12px] text-slate-500">
          <span>
            Showing {start + 1}-{start + visible.length} of {total} promises
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1">
              Rows per page
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                className="h-7 rounded-md border border-slate-200 bg-white px-1 text-[12px]"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
              className="h-7 rounded-md border border-slate-200 px-2 font-semibold text-slate-600 disabled:opacity-40"
            >
              Prev
            </button>
            <span>
              {current} / {totalPages}
            </span>
            <button
              type="button"
              disabled={current >= totalPages}
              onClick={() => setPage(current + 1)}
              className="h-7 rounded-md border border-slate-200 px-2 font-semibold text-slate-600 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}