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
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <ChartColumn className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-800">Collector Performance</h2>
            <p className="text-[11px] text-slate-500">Collections achieved vs target (Month to Date)</p>
          </div>
        </div>
        <label className="relative inline-flex">
          <span className="sr-only">Select month</span>
          <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
          <select
            value={selection}
            onChange={(event) => setSelection(event.target.value)}
            className="h-8 appearance-none rounded-lg border border-slate-200 bg-white pl-8 pr-8 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
          >
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
        </label>
      </div>

      <div className={`overflow-x-auto rounded-md border border-slate-200 transition-opacity ${loading ? "opacity-50" : ""}`} aria-busy={loading}>
        <table className="w-full min-w-[680px] text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Collector</th>
              <th className="px-3 py-2" colSpan={2}>Achievement</th>
              <th className="px-3 py-2 text-center">Collected / Target</th>
              <th className="px-3 py-2 text-center">Remaining</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: getAvatarColor(row.name) }}>
                      {row.initials || getInitials(row.name)}
                    </span>
                    <span className="font-semibold text-slate-800">{row.name}</span>
                  </div>
                </td>
                <td className="w-[40%] px-3 py-2.5">
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${row.percentage}%`, backgroundColor: row.color }} />
                  </div>
                </td>
                <td className="w-[72px] px-2 py-2.5">
                  <span className="inline-block min-w-[52px] rounded bg-orange-50 px-1.5 py-0.5 text-center text-[11px] font-semibold" style={{ color: row.color }}>
                    {row.achievementLabel ?? `${row.percentage}%`}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-center">
                  <b className="text-slate-800">{row.collectedLabel}</b>
                  <span className="text-slate-500"> / {row.targetLabel}</span>
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span className={`inline-block min-w-[64px] rounded px-1.5 py-0.5 text-[11px] font-bold ${row.remaining > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
                    {row.remaining > 0 ? formatCompactCurrency(row.remaining) : "Achieved"}
                  </span>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-slate-500">
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
