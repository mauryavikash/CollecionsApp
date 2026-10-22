"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import WorkbenchKpis from "@/components/workbench/WorkbenchKpis";
import WorkbenchTable from "@/components/workbench/WorkbenchTable";
import { LoadingState } from "@/components/common/LoadingState";
import { getDashboard, getWorkbench } from "@/app/lib/api";
import { formatCompactCurrency, parseCurrency } from "@/utils/helpers";

const RISK_ORDER = { Critical: 4, High: 3, Medium: 2, Low: 1 };
const BUCKET_ORDER = { "181+ days": 5, "91-180 days": 4, "61-90 days": 3, "31-60 days": 2, "1-30 days": 1 };

function formatAsOf(date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(date) {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function findKpi(kpis, keyword) {
  return kpis.find((kpi) => String(kpi?.label ?? "").toLowerCase().includes(keyword));
}

export default function CollectorWorkbenchPage() {
  const [data, setData] = useState(null);
  const [totalAr, setTotalAr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);

  const load = useCallback(
    ({ force = false } = {}) =>
      Promise.all([getWorkbench({ force }), getDashboard({}, { force }).catch(() => null)])
        .then(([workbench, dashboard]) => {
          const payload = workbench?.data ?? workbench;
          const arKpi = (dashboard?.kpis ?? []).find((kpi) => kpi?.id === "total-ar");
          setError(null);
          setData(payload?.collectorWorkbench ?? payload ?? null);
          setTotalAr(arKpi?.valueRaw ?? null);
          setFetchedAt(new Date());
        })
        .catch((err) => {
          console.error("Workbench API Error:", err);
          setError(err);
        })
        .finally(() => {
          setLoading(false);
          setRefreshing(false);
        }),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const accounts = useMemo(
    () =>
      (data?.workbenchAccounts ?? data?.accounts ?? []).map((account) => ({
        ...account,
        overdueRaw: parseCurrency(account.overdue),
        dpd: Number(account.dpd) || 0,
        riskOrder: RISK_ORDER[account.risk] ?? 0,
        bucketOrder: BUCKET_ORDER[account.bucket] ?? 0,
        noteCount: account.noteCount ?? (account.note ? 1 : 0),
      })),
    [data],
  );

  const kpis = useMemo(() => {
    const source = data?.kpis ?? data?.summary ?? [];
    const total = accounts.length;
    const pct = (value, base) => (base ? `${((value / base) * 100).toFixed(1)}%` : "-");
    const overdueRaw = accounts.reduce((sum, account) => sum + Math.max(account.overdueRaw, 0), 0);
    const highRisk = accounts.filter((account) => account.riskOrder >= RISK_ORDER.High).length;
    const withPtp = accounts.filter((account) => account.ptp && account.ptp !== "None").length;
    const avgDpd = total ? Math.round(accounts.reduce((sum, account) => sum + account.dpd, 0) / total) : 0;

    const extras = {
      "total overdue": {
        fallback: formatCompactCurrency(overdueRaw),
        supporting: totalAr ? `${pct(parseCurrency(findKpi(source, "overdue")?.value) || overdueRaw, totalAr)} of Total AR` : `${total} accounts`,
      },
      "high risk": { fallback: String(highRisk), supporting: `${pct(highRisk, total)} of overdue customers` },
      "active ptp": { fallback: String(withPtp), supporting: `${pct(withPtp, total)} PTP coverage` },
      "avg dpd": { fallback: String(avgDpd), supporting: `Across ${total} accounts`, badge: "Lower is better" },
    };

    return Object.entries(extras).map(([key, extra]) => {
      const kpi = findKpi(source, key) ?? {};
      return {
        label: kpi.label ?? key.replace(/\b\w/g, (char) => char.toUpperCase()).replace("Dpd", "DPD").replace("Ptp", "PTPs"),
        value: kpi.value ?? extra.fallback,
        supporting: kpi.supporting ?? extra.supporting,
        trend: kpi.trend,
        trendDirection: kpi.trendDirection,
        positive: kpi.positive,
        badge: extra.badge,
      };
    });
  }, [data, accounts, totalAr]);

  if (loading) {
    return <LoadingState label="Loading workbench data..." />;
  }

  return (
    <main className="min-h-full min-w-0 pr-2 text-slate-700 sm:pr-4" data-has-error={Boolean(error)}>
      <div className="mx-auto max-w-[1680px]">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-bold leading-7 text-slate-900">{data?.title ?? "Collector Workbench"}</h1>
            <p className="text-[13px] text-slate-600">
              {data?.subtitle ?? "Daily action queue"}
              {fetchedAt && ` • As of ${formatAsOf(fetchedAt)}, ${formatTime(fetchedAt)}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setRefreshing(true);
                load({ force: true });
              }}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing" : "Refresh"}
            </button>
            {fetchedAt && <span className="text-[13px] text-slate-500">Refreshed {formatTime(fetchedAt)}</span>}
          </div>
        </header>

        {error && !data ? (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-600">Unable to load workbench data. Please refresh.</p>
        ) : (
          <>
            <WorkbenchKpis kpis={kpis} asOf={fetchedAt ? formatAsOf(fetchedAt) : ""} />
            <WorkbenchTable accounts={accounts} />
          </>
        )}
      </div>
    </main>
  );
}
