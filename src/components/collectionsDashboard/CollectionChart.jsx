"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Users } from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function Panel({ children, className = "" }) {
  return (
    <section
      className={`h-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

const statusClasses = {
  Paid: "bg-emerald-50 text-emerald-600",
  Active: "bg-blue-50 text-blue-600",
  "Open Promise": "bg-blue-50 text-blue-600",
  Pending: "bg-amber-50 text-amber-600",
  Broken: "bg-rose-50 text-rose-600",
  "Broken Promise": "bg-rose-50 text-rose-600",
  Partial: "bg-amber-50 text-amber-600",
  Fulfilled: "bg-emerald-50 text-emerald-600",
};

const PTP_PAGE_SIZE = 5;

export default function CollectionChart({
  riskDistribution = [],
  ptpActivity = [],
  ptpActivityMeta,
}) {
  const router = useRouter();
  const ptpRows = useMemo(() => ptpActivity ?? [], [ptpActivity]);
  const [ptpPage, setPtpPage] = useState(1);

  useEffect(() => {
    setPtpPage(1);
  }, [ptpRows]);

  const ptpTotalPages = Math.max(1, Math.ceil(ptpRows.length / PTP_PAGE_SIZE));
  const ptpStart = (ptpPage - 1) * PTP_PAGE_SIZE;
  const ptpPageRows = ptpRows.slice(ptpStart, ptpStart + PTP_PAGE_SIZE);
  const ptpTotal = ptpActivityMeta?.total ?? ptpRows.length;

  /* API may provide count, or just percentage + amount.
     Derive a total from count when available, otherwise sum percentages as a proxy. */
  const hasCount = riskDistribution.some((r) => r.count != null && Number(r.count) > 0);
  const totalAccounts = hasCount
    ? riskDistribution.reduce((s, r) => s + (Number(r.count) || 0), 0)
    : riskDistribution.reduce((s, r) => s + (Number(r.percentage) || 0), 0) > 0
      ? riskDistribution.length
      : 0;
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(340px,1fr)_minmax(0,2fr)]">
      {/* RISK DISTRIBUTION */}
      <Panel className="min-h-[280px]">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50">
            <Users className="h-4 w-4 text-rose-500" aria-hidden="true" />
          </span>
          Risk Distribution
        </h2>

        <div className="mt-2 flex flex-col items-center gap-4 py-2 sm:min-h-[220px] sm:flex-row sm:gap-6">
          <div className="relative h-[160px] w-[160px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${props?.payload?.count ?? value} (${value}%)`,
                    props?.payload?.label || "",
                  ]}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
                <Pie
                  data={riskDistribution}
                  dataKey="percentage"
                  innerRadius={45}
                  outerRadius={65}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`${entry.label}-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[20px] font-bold text-slate-800">
                {hasCount ? totalAccounts : (riskDistribution.length > 0 ? "" : "")}
              </span>
              <span className="text-[11px] text-slate-400">
                {hasCount ? "Accounts" : (riskDistribution.length > 0 ? "" : "")}
              </span>
            </div>
          </div>

          <div className="w-full min-w-0 flex-1 space-y-2">
            {riskDistribution.map((risk, index) => (
              <p
                key={`${risk.label}-${index}`}
                className="flex items-center gap-2 text-xs"
              >
                <i className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: risk.color }} />
                <span className="flex-1 text-slate-600">{risk.label}</span>
                <span className="font-semibold text-slate-800">
                  {risk.count != null ? `${risk.count} (${risk.percentage}%)` : `${risk.amount} (${risk.percentage}%)`}
                </span>
              </p>
            ))}
          </div>
        </div>
      </Panel>

      {/* RECENT PTP ACTIVITY */}
      <Panel className="min-h-[280px] flex flex-col">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h2 className="flex min-w-0 items-center gap-2 text-sm font-bold text-slate-800">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
              <CalendarDays className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            </span>
            Recent Promise-to-Pay (PTP) Activity
          </h2>
          <button
            type="button"
            onClick={() => router.push("/promiseToPay")}
            className="shrink-0 whitespace-nowrap text-xs font-semibold text-blue-600 hover:underline"
          >
            View All &rsaquo;
          </button>
        </div>

        <div className="flex-1 overflow-x-auto rounded-md border border-slate-200">
          <table className="w-full min-w-[420px] table-fixed text-left text-xs">
            {/* Balanced widths so the customer column doesn't push the other columns to the far edge. */}
            <colgroup>
              <col className="w-[36%]" />
              <col className="w-[20%]" />
              <col className="w-[24%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-1.5 text-left font-bold">CUSTOMER</th>
                <th className="whitespace-nowrap px-3 py-1.5 text-left font-bold">PTP AMOUNT</th>
                <th className="whitespace-nowrap px-3 py-1.5 text-left font-bold">PROMISE DATE</th>
                <th className="whitespace-nowrap px-3 py-1.5 text-left font-bold">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {ptpPageRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-2 py-6 text-center text-slate-400">
                    No PTP activity
                  </td>
                </tr>
              )}
              {ptpPageRows.map((item, index) => (
                <tr key={`${item.id ?? item.customer}-${ptpStart + index}`} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2 font-medium" title={item.customer}>
                    {item.id ? (
                      <Link href={`/account?id=${encodeURIComponent(item.id)}`} className="block truncate text-blue-600 hover:underline">
                        {item.customer}
                      </Link>
                    ) : (
                      <span className="block truncate text-blue-600">{item.customer}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-left font-bold text-slate-800">{item.amount}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-left text-slate-500">{item.promiseDate}</td>
                  <td className="px-3 py-2 text-left">
                    <span className={`whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-semibold ${statusClasses[item.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500">
            {ptpRows.length > 0
              ? `Showing ${ptpStart + 1}\u2013${Math.min(ptpStart + PTP_PAGE_SIZE, ptpRows.length)} of ${ptpRows.length}` +
                (ptpTotal > ptpRows.length ? ` recent (${ptpTotal} total PTPs)` : "")
              : "Showing 0 records"}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous page"
              onClick={() => setPtpPage((p) => Math.max(1, p - 1))}
              disabled={ptpPage <= 1}
              className="grid h-5 w-5 place-items-center rounded border border-slate-200 text-slate-600 disabled:opacity-40"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            {Array.from({ length: ptpTotalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                aria-current={n === ptpPage ? "page" : undefined}
                onClick={() => setPtpPage(n)}
                className={`grid h-5 min-w-5 place-items-center rounded px-1 text-[11px] font-medium ${
                  n === ptpPage ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              aria-label="Next page"
              onClick={() => setPtpPage((p) => Math.min(ptpTotalPages, p + 1))}
              disabled={ptpPage >= ptpTotalPages}
              className="grid h-5 w-5 place-items-center rounded border border-slate-200 text-slate-600 disabled:opacity-40"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
}