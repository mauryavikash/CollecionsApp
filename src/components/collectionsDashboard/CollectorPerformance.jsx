"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChartColumn, ChevronDown } from "lucide-react";
import { getDashboard } from "@/app/lib/api";
import { formatCompactCurrency, getAvatarColor, getInitials } from "@/utils/helpers";

function monthLabel(year, month) {
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function buildMonthOptions(availableYears = []) {
  const now = new Date();
  const years = availableYears.length ? availableYears : [now.getFullYear()];
  return [...years]
    .sort((a, b) => b - a)
    .flatMap((year) => {
      const lastMonth = year === now.getFullYear() ? now.getMonth() + 1 : 12;
      return Array.from({ length: lastMonth }, (_, index) => lastMonth - index).map((month) => ({
        value: `${year}-${month}`,
        year,
        month,
        label: monthLabel(year, month),
      }));
    });
}

const EMPTY = [];

// Rows such as "ERROR:#N/A" come from unmapped collector IDs in the source data.
function isValidCollector(collector) {
  return collector?.name && !/^error/i.test(collector.name);
}

export default function CollectorPerformance({ collectors: initialCollectors = EMPTY, meta, availableYears }) {
  const now = new Date();
  const initialYear = meta?.year ?? now.getFullYear();
  const initialMonth = meta?.month ?? now.getMonth() + 1;
  const initialSelection = `${initialYear}-${initialMonth}`;
  const [selection, setSelection] = useState(initialSelection);
  const [fetched, setFetched] = useState({ key: null, collectors: EMPTY });
  const monthOptions = useMemo(() => buildMonthOptions(availableYears), [availableYears]);
  const [year, month] = selection.split("-").map(Number);
  const isInitial = selection === initialSelection;
  const loading = !isInitial && fetched.key !== selection;
  const collectors = isInitial ? initialCollectors : fetched.key === selection ? fetched.collectors : EMPTY;

  useEffect(() => {
    if (isInitial) return undefined;
    let active = true;
    getDashboard({ year, month })
      .then((response) => {
        const payload = response?.data ?? response;
        if (active) setFetched({ key: selection, collectors: payload?.collectors ?? EMPTY });
      })
      .catch((error) => {
        console.error("Collector performance API Error:", error);
        if (active) setFetched({ key: selection, collectors: EMPTY });
      });
    return () => {
      active = false;
    };
  }, [isInitial, selection, year, month]);

  const rows = collectors.filter(isValidCollector).map((collector) => {
    const collected = Number(collector.collectionsRaw) || 0;
    const target = Number(collector.targetRaw) || 0;
    const percentage = Number(collector.percentage ?? collector.achievement) || (target ? Math.round((collected / target) * 100) : 0);
    return {
      ...collector,
      percentage: Math.min(percentage, 100),
      collectedLabel: collector.collections ?? collector.achieved ?? formatCompactCurrency(collected),
      targetLabel: collector.target ?? formatCompactCurrency(target),
      remaining: Math.max(target - collected, 0),
    };
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-[0_2px_6px_rgba(38,82,144,.08)]">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-600">
            <ChartColumn className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-[16px] font-bold text-slate-800">Collector Performance</h2>
            <p className="text-[12px] text-slate-500">Collections achieved vs target (Month to Date)</p>
          </div>
        </div>
        <label className="relative inline-flex">
          <span className="sr-only">Select month</span>
          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
          <select
            value={selection}
            onChange={(event) => setSelection(event.target.value)}
            className="h-9 appearance-none rounded-full border border-slate-200 bg-slate-50 pl-9 pr-9 text-[13px] font-semibold text-slate-700 outline-none focus:border-blue-500"
          >
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
        </label>
      </div>

      <div className={`overflow-x-auto transition-opacity ${loading ? "opacity-50" : ""}`} aria-busy={loading}>
        <table className="w-full min-w-[760px] text-left">
          <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2.5">Collector</th>
              <th className="px-3 py-2.5" colSpan={2}>Achievement</th>
              <th className="px-3 py-2.5 text-center">Collected / Target</th>
              <th className="px-3 py-2.5 text-center">Remaining</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-t border-slate-100">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2.5 whitespace-nowrap">
                    <span className="grid h-8 w-8 place-items-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: getAvatarColor(row.name) }}>
                      {row.initials || getInitials(row.name)}
                    </span>
                    <span className="text-[14px] font-semibold text-slate-800">{row.name}</span>
                  </div>
                </td>
                <td className="w-[40%] px-3 py-3">
                  <div className="h-2.5 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${row.percentage}%`, backgroundColor: row.color }} />
                  </div>
                </td>
                <td className="w-[80px] px-2 py-3">
                  <span className="inline-block min-w-[56px] rounded-md bg-orange-50 px-2 py-1 text-center text-[13px] font-semibold" style={{ color: row.color }}>
                    {row.achievementLabel ?? `${row.percentage}%`}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-center text-[14px]">
                  <b className="text-slate-900">{row.collectedLabel}</b>
                  <span className="text-slate-500"> / {row.targetLabel}</span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className={`inline-block min-w-[72px] rounded-md px-2 py-1 text-[13px] font-bold ${row.remaining > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
                    {row.remaining > 0 ? formatCompactCurrency(row.remaining) : "Achieved"}
                  </span>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[13px] text-slate-500">
                  {loading ? "Loading collector performance..." : "No collector performance data for this month."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
