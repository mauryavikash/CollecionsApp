"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import WorkbenchKpis from "@/components/workbench/WorkbenchKpis";
import WorkbenchTable from "@/components/workbench/WorkbenchTable";
import { LoadingState } from "@/components/common/LoadingState";
import { getDashboard, getWorkbench } from "@/app/lib/api";
import { formatCompactCurrency, parseCurrency } from "@/utils/helpers";

const RISK_ORDER = { Critical: 4, High: 3, Medium: 2, Low: 1 };
const BUCKET_ORDER = { "181+ days": 5, "91-180 days": 4, "61-90 days": 3, "31-60 days": 2, "1-30 days": 1 };
const BUCKETS = ["1-30 days", "31-60 days", "61-90 days", "91-180 days", "181+ days"];
const BUCKET_COLORS = ["#4bc173", "#9bd138", "#facc15", "#fb9337", "#f15a63"];
const RISK_COLORS = { Critical: "#f2545b", High: "#ff9f43", Medium: "#ffd23f", Low: "#50c878" };
const PTP_COLORS = { Active: "#0d9488", Broken: "#ef4444", Fulfilled: "#16a34a", None: "#94a3b8" };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function findKpi(kpis, keyword) {
  return kpis.find((kpi) => String(kpi?.label ?? "").toLowerCase().includes(keyword));
}

/* Backend business date ("17 Sep 2026"), never the browser clock. */
function resolveAsOf(dashboard) {
  const iso = dashboard?.asOfDate;
  if (iso) {
    const date = new Date(iso);
    if (!Number.isNaN(date.getTime())) {
      return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
    }
  }
  const text = dashboard?.dateLabel ?? dashboard?.asOf;
  return text ? String(text).replace(/^As of\s*/i, "").split(",")[0].trim() : null;
}

/* Trend fields from the backend KPI (changePct, changeDirection, sentiment, previousValue, previousPeriodLabel). */
function kpiTrend(kpi) {
  if (kpi?.changePct === null || kpi?.changePct === undefined || kpi?.changePct === "") return {};
  const number = parseFloat(String(kpi.changePct).replace(/[^0-9.+-]/g, ""));
  if (!Number.isFinite(number)) return {};
  const sentiment = kpi.sentiment ?? kpi.changeSentiment;
  const previousLabel = kpi.previousPeriodLabel
    ? kpi.previousPeriodLabel.replace(/^As of/i, "as of")
    : kpi.previousLabel ?? "previous period";
  return {
    trend: `${Math.abs(number).toFixed(1)}%`,
    trendDirection: kpi.changeDirection ?? (number >= 0 ? "up" : "down"),
    positive: sentiment ? sentiment === "positive" : number <= 0,
    trendLabel: kpi.changeLabel ?? "vs prior period",
    previous: kpi.previousValue ? `${kpi.previousValue} ${previousLabel}` : null,
  };
}

export default function CollectorWorkbenchPage() {
  const [data, setData] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(
    ({ force = false } = {}) =>
      Promise.all([getWorkbench({ force }), getDashboard({}, { force }).catch(() => null)])
        .then(([workbench, dashboardResponse]) => {
          const payload = workbench?.data ?? workbench;
          const dash = dashboardResponse?.data ?? dashboardResponse;
          setError(null);
          setData(payload?.collectorWorkbench ?? payload ?? null);
          setDashboard(dash?.collectionsDashboard ?? dash ?? null);
        })
        .catch((err) => {
          console.error("Workbench API Error:", err);
          setError(err);
        })
        .finally(() => {
          setLoading(false);
        }),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const asOf = resolveAsOf(dashboard);
  const totalAr = (dashboard?.kpis ?? []).find((kpi) => kpi?.id === "total-ar")?.valueRaw ?? null;

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
    const dashKpis = dashboard?.kpis ?? [];
    const total = accounts.length;
    const pct = (value, base) => (base ? `${((value / base) * 100).toFixed(1)}%` : "-");
    const overdueRaw = accounts.reduce((sum, account) => sum + Math.max(account.overdueRaw, 0), 0);
    const highRisk = accounts.filter((account) => account.riskOrder >= RISK_ORDER.High).length;
    const withPtp = accounts.filter((account) => account.ptp && account.ptp !== "None").length;
    const avgDpd = total ? Math.round(accounts.reduce((sum, account) => sum + account.dpd, 0) / total) : 0;
    const countBy = (key, values) => values.map((value) => accounts.filter((account) => account[key] === value).length);

    const bucketAmounts = BUCKETS.map((bucket) =>
      accounts.filter((account) => account.bucket === bucket).reduce((sum, account) => sum + Math.max(account.overdueRaw, 0), 0),
    );
    const riskLevels = Object.keys(RISK_COLORS);
    const ptpStates = Object.keys(PTP_COLORS);
    const bucketCounts = countBy("bucket", BUCKETS);
    const riskCounts = countBy("risk", riskLevels);
    const ptpCounts = countBy("ptp", ptpStates);
    const avgDpdByBucket = BUCKETS.map((bucket) => {
      const rows = accounts.filter((account) => account.bucket === bucket);
      return rows.length ? Math.round(rows.reduce((sum, account) => sum + account.dpd, 0) / rows.length) : 0;
    });

    const extras = {
      "total overdue": {
        fallback: formatCompactCurrency(overdueRaw),
        supporting: totalAr ? `${pct(parseCurrency(findKpi(source, "overdue")?.value) || overdueRaw, totalAr)} of Total AR` : `${total} accounts`,
        ...kpiTrend(dashKpis.find((kpi) => kpi?.id === "overdue")),
        chart: {
          type: "bar",
          color: "#0284c7",
          data: BUCKETS.map((bucket, index) => ({
            label: bucket,
            value: bucketAmounts[index],
            display: `${formatCompactCurrency(bucketAmounts[index])} overdue`,
            color: BUCKET_COLORS[index],
          })),
        },
      },
      "high risk": {
        fallback: String(highRisk),
        supporting: `${pct(highRisk, total)} of overdue customers`,
        ...kpiTrend(dashKpis.find((kpi) => kpi?.id === "risk")),
        chart: {
          type: "bar",
          color: "#ef4444",
          data: riskLevels.map((level, index) => ({
            label: `${level} risk`,
            value: riskCounts[index],
            display: `${riskCounts[index]} accounts`,
            color: RISK_COLORS[level],
          })),
        },
      },
      "active ptp": {
        fallback: String(withPtp),
        supporting: `${pct(withPtp, total)} PTP coverage`,
        chart: {
          type: "bar",
          color: "#0d9488",
          data: ptpStates.map((state, index) => ({
            label: state === "None" ? "No PTP" : `${state} PTP`,
            value: ptpCounts[index],
            display: `${ptpCounts[index]} accounts`,
            color: PTP_COLORS[state],
          })),
        },
      },
      "avg dpd": {
        fallback: String(avgDpd),
        supporting: `Across ${total} accounts`,
        badge: "Lower is better",
        chart: {
          type: "bar",
          color: "#4f46e5",
          data: BUCKETS.map((bucket, index) => ({
            label: bucket,
            value: avgDpdByBucket[index],
            display: `Avg ${avgDpdByBucket[index]} DPD`,
            note: `${bucketCounts[index]} accounts`,
            color: BUCKET_COLORS[index],
          })),
        },
      },
    };

    return Object.entries(extras).map(([key, extra]) => {
      const kpi = findKpi(source, key) ?? {};
      const trend = kpiTrend(kpi);
      return {
        ...extra,
        ...(trend.trend ? trend : {}),
        label: kpi.label ?? key.replace(/\b\w/g, (char) => char.toUpperCase()).replace("Dpd", "DPD").replace("Ptp", "PTPs"),
        value: kpi.value ?? extra.fallback,
        supporting: kpi.subtext ?? kpi.supporting ?? extra.supporting,
        badge: kpi.badge ?? extra.badge,
        dateLabel: kpi.dateLabel ?? (asOf ? `As of ${asOf}` : null),
      };
    });
  }, [data, dashboard, accounts, totalAr, asOf]);

  if (loading) {
    return <LoadingState label="Loading workbench data..." />;
  }

  return (
    <main className="min-h-full min-w-0 pr-2 text-slate-700 sm:pr-4" data-has-error={Boolean(error)}>
      <div className="mx-auto max-w-[1680px]">
        {error && !data ? (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-600">Unable to load workbench data. Please reload the page.</p>
        ) : (
          <>
            <WorkbenchKpis kpis={kpis} asOf={asOf ?? ""} />
            <WorkbenchTable accounts={accounts} asOfIso={dashboard?.asOfDate} />
          </>
        )}
      </div>
    </main>
  );
}