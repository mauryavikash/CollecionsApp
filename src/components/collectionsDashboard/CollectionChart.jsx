"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
      className={`rounded-[11px] border border-slate-200 bg-white px-3 py-2.5 shadow-[0_2px_5px_rgba(38,82,144,.08)] ${className}`}
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
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {/* RISK DISTRIBUTION */}
      <Panel className="min-h-[280px]">
        <h2 className="text-[13px] font-bold">Risk Distribution</h2>

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
              <span className="text-[9px] text-slate-400">
                {hasCount ? "Accounts" : (riskDistribution.length > 0 ? "" : "")}
              </span>
            </div>
          </div>

          <div className="w-full min-w-0 flex-1 space-y-2">
            {riskDistribution.map((risk, index) => (
              <p
                key={`${risk.label}-${index}`}
                className="flex items-center gap-2 text-[11px]"
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
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[13px] font-bold">Recent Promise-to-Pay (PTP) Activity</h2>
          <button
            type="button"
            onClick={() => router.push("/promiseToPay")}
            className="text-[10px] font-semibold text-blue-600 hover:underline"
          >
            View All &rsaquo;
          </button>
        </div>

        <div className="flex-1 overflow-x-auto rounded-md border border-slate-200">
          <table className="w-full min-w-[420px] text-left text-[10px]">
            <thead className="bg-slate-50 text-[9px] text-slate-500">
              <tr>
                <th className="px-2 py-1.5 font-bold">CUSTOMER</th>
                <th className="px-2 py-1.5 font-bold text-right">PTP AMOUNT</th>
                <th className="px-2 py-1.5 font-bold">PROMISE DATE</th>
                <th className="px-2 py-1.5 font-bold">STATUS</th>
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
                  <td className="px-2 py-2 text-[10px] font-medium text-slate-700 truncate max-w-[140px]" title={item.customer}>
                    {item.customer}
                  </td>
                  <td className="px-2 py-2 text-right font-bold text-slate-800">{item.amount}</td>
                  <td className="px-2 py-2 text-slate-500">{item.promiseDate}</td>
                  <td className="px-2 py-2">
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${statusClasses[item.status] ?? "bg-slate-100 text-slate-600"}`}>
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
          <span className="text-[9px] text-slate-500">
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
                className={`grid h-5 min-w-5 place-items-center rounded px-1 text-[9px] font-medium ${
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