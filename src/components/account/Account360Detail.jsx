"use client";

import { useState } from "react";
import { CalendarDays, CircleCheck, Clock3, Coins, FileText, Star, TriangleAlert } from "lucide-react";
import KpiCard from "@/components/common/KpiCard";
import { MONTHS_SHORT, formatCompactMoney, moneyTrendPoints, parseIsoDate } from "@/components/common/dateRanges";
import { getMetric, monthlyCounts } from "./accountData";

function riskBadgeClass(risk = "") {
  const value = risk.toLowerCase();
  if (value.includes("critical")) return "border-red-200 bg-red-50 text-red-700";
  if (value.includes("high")) return "border-orange-200 bg-orange-50 text-orange-700";
  if (value.includes("medium")) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-green-200 bg-green-50 text-green-700";
}

function ptpBadgeClass(ptp = "") {
  const value = ptp.toLowerCase();
  if (value.includes("broken")) return "border-red-200 bg-red-50 text-red-600";
  if (value.includes("partial")) return "border-violet-200 bg-violet-50 text-violet-600";
  if (value.includes("active") || value.includes("open")) return "border-blue-200 bg-blue-50 text-blue-600";
  if (value.includes("fulfilled")) return "border-green-200 bg-green-50 text-green-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

const AGING_COLORS = ["#4bc173", "#9bd138", "#facc15", "#fb9337", "#f15a63"];

// Backend metric (account.metrics[]) by id, falling back to a label keyword match.
function findMetric(account, id, keyword) {
  return (account?.metrics ?? []).find((metric) => metric?.id === id) ?? getMetric(account, keyword);
}

// "+12.4%" / "+17 days" -> pill text without sign; direction from the backend.
function buildChange(metric) {
  if (!metric || metric.changePct == null || metric.changePct === "") return null;
  const raw = String(metric.changePct).trim();
  if (metric.changeDirection === "neutral" || Number.parseFloat(raw) === 0) return null;
  const numeric = Number.parseFloat(raw);
  const up = metric.changeDirection ? metric.changeDirection === "up" : numeric >= 0;
  return {
    change: { text: raw.replace(/^[+-]/, ""), up },
    positive: metric.changeSentiment ? metric.changeSentiment !== "negative" : !up,
  };
}

function comparisonLabel(metric) {
  if (!metric || metric.changePct == null || metric.changePct === "") return "";
  const label = metric.changeLabel ?? "vs last month";
  const raw = String(metric.changePct).trim();
  return metric.changeDirection === "neutral" || Number.parseFloat(raw) === 0 ? `No change ${label}` : label;
}

function seriesValues(metric) {
  return Array.isArray(metric?.values) ? metric.values.map(Number).filter(Number.isFinite) : [];
}

/* Month labels ending at the as-of month: ["Apr 2026", …, "Sep 2026"]. */
function monthLabels(asOfIso, count) {
  const end = parseIsoDate(asOfIso);
  return Array.from({ length: count }, (_, index) => {
    if (!end) return `Month ${index + 1}`;
    const date = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - (count - 1 - index), 1));
    return `${MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  });
}

function previousText(metric) {
  if (metric?.previousValue == null || metric.previousValue === "") return null;
  return `${metric.previousValue} ${metric.previousLabel ?? "previous month"}`;
}

function buildMetrics({ account, aging, transactions, ptpHistory, ptpTotal, asOfIso }) {
  const overdueInvoices = transactions.filter((item) => item.status === "Overdue");
  const overdueMetric = findMetric(account, "overdue", "overdue");
  const arMetric = findMetric(account, "total-ar", "total ar");
  const dpdMetric = findMetric(account, "dpd", "days");
  const agingMetric = findMetric(account, "aging", "aging");
  const brokenMetric = findMetric(account, "broken-ptp", "broken");
  const fulfilledMetric = findMetric(account, "fulfilled-ptp", "fulfilled");
  const oldestBucket = [...aging].reverse().find((bucket) => bucket.percent > 0);
  const brokenCount = ptpHistory.filter((item) => String(item?.status).toLowerCase() === "broken").length;
  const fulfilledCount = ptpHistory.filter((item) => String(item?.status).toLowerCase() === "fulfilled").length;
  const promiseCount = ptpTotal ?? ptpHistory.length;

  const agingChart = {
    type: "bar",
    color: "#ef4444",
    data: aging.map((bucket, index) => ({
      label: bucket.label ?? bucket.short,
      value: Math.max(Number(bucket.amountRaw) || 0, 0),
      display: `${formatCompactMoney(bucket.amountRaw)} (${bucket.percent}%)`,
      color: AGING_COLORS[index % AGING_COLORS.length],
    })),
  };

  const arValues = seriesValues(arMetric);
  const agingValues = seriesValues(agingMetric);
  const monthlyChart = (metric, status, color) => {
    const values = seriesValues(metric);
    const series = values.length ? values : monthlyCounts(ptpHistory, status);
    const labels = monthLabels(asOfIso, series.length);
    return {
      type: "bar",
      color,
      data: series.map((value, index) => ({ label: labels[index], value, display: `${value} promise${value === 1 ? "" : "s"}` })),
    };
  };

  const dpdChart =
    dpdMetric?.previousValueRaw != null && dpdMetric?.valueRaw != null
      ? {
          type: "bar",
          color: "#8b5cf6",
          data: [
            { label: dpdMetric.previousLabel ?? "Previous month", value: Number(dpdMetric.previousValueRaw), color: "#c4b5fd" },
            { label: "Current", value: Number(dpdMetric.valueRaw), color: "#8b5cf6" },
          ].map((row) => ({ ...row, display: `${row.value} days` })),
        }
      : null;

  return [
    {
      label: "Overdue Amount",
      value: overdueMetric?.value ?? "-",
      ...buildChange(overdueMetric),
      changeLabel: comparisonLabel(overdueMetric),
      footnote: previousText(overdueMetric) ?? `${overdueInvoices.length} overdue invoices`,
      tooltip: "Total past-due balance across open invoices",
      Icon: Coins,
      color: "#ef4444",
      chart: agingChart,
    },
    {
      label: "Total AR",
      value: arMetric?.value ?? "-",
      ...buildChange(arMetric),
      changeLabel: comparisonLabel(arMetric),
      footnote: previousText(arMetric) ?? `${transactions.length} recent transactions`,
      tooltip: "Total open accounts receivable",
      Icon: FileText,
      color: "#3b82f6",
      chart: arValues.length > 1
        ? {
            type: "area",
            color: "#3b82f6",
            data: moneyTrendPoints(arMetric, asOfIso),
          }
        : null,
    },
    {
      label: "Days Past Due",
      value: dpdMetric?.value ?? "-",
      ...buildChange(dpdMetric),
      changeLabel: comparisonLabel(dpdMetric),
      footnote: previousText(dpdMetric) ?? "Oldest open invoice",
      tooltip: "Days past due of the oldest open invoice",
      Icon: CalendarDays,
      color: "#8b5cf6",
      chart: dpdChart,
    },
    {
      label: "Aging Bucket",
      value: agingMetric?.value ?? "-",
      changeLabel: agingMetric?.context ?? (oldestBucket ? `${oldestBucket.percent}% of AR in ${oldestBucket.short}` : ""),
      footnote: "Share of overdue by bucket",
      tooltip: "Aging bucket of the oldest open invoice",
      Icon: Clock3,
      color: "#f97316",
      chart: agingValues.length
        ? {
            type: "bar",
            color: "#f97316",
            data: agingValues.map((value, index) => ({
              label: agingMetric?.labels?.[index] ?? aging[index]?.label ?? `Bucket ${index + 1}`,
              value,
              display: `${value}% of overdue`,
              color: AGING_COLORS[index % AGING_COLORS.length],
            })),
          }
        : null,
    },
    {
      label: "Broken PTPs",
      value: brokenMetric?.value ?? String(brokenCount),
      ...buildChange(brokenMetric),
      changeLabel: comparisonLabel(brokenMetric),
      footnote: `of ${promiseCount} promises`,
      tooltip: "Promises to pay that were not honored",
      Icon: TriangleAlert,
      color: "#ef4444",
      chart: monthlyChart(brokenMetric, "broken", "#ef4444"),
    },
    {
      label: "Fulfilled PTPs",
      value: fulfilledMetric?.value ?? String(fulfilledCount),
      ...buildChange(fulfilledMetric),
      changeLabel: comparisonLabel(fulfilledMetric),
      footnote: `of ${promiseCount} promises`,
      tooltip: "Promises to pay honored in full",
      Icon: CircleCheck,
      color: "#16a34a",
      chart: monthlyChart(fulfilledMetric, "fulfilled", "#16a34a"),
    },
  ];
}

export default function Account360Detail({ account = {}, industry, aging = [], transactions = [], ptpHistory = [], ptpTotal, asOfDate }) {
  const favoriteKey = `account-favorite-${account.id}`;
  const [favorite, setFavorite] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(favoriteKey) === "true",
  );

  const toggleFavorite = () => {
    const next = !favorite;
    setFavorite(next);
    localStorage.setItem(favoriteKey, String(next));
  };

  const metrics = buildMetrics({ account, aging, transactions, ptpHistory, ptpTotal, asOfIso: asOfDate });

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex min-w-0 gap-3">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-blue-600 text-[20px] font-bold text-white">
          {account.initials}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">{account.name}</h1>
            <button
              type="button"
              onClick={toggleFavorite}
              aria-pressed={favorite}
              aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
              className="text-slate-400 hover:text-amber-500"
            >
              <Star className={`h-5 w-5 ${favorite ? "fill-amber-400 text-amber-500" : ""}`} />
            </button>
            {account.risk && (
              <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${riskBadgeClass(account.riskSegment ?? account.risk)}`}>
                {account.risk}
              </span>
            )}
            {account.ptp && (
              <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${ptpBadgeClass(account.ptpStatus ?? account.ptp)}`}>
                {account.ptp}
              </span>
            )}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-slate-600">
            <span>Acct #{account.accountNumber ?? account.id}</span>
            {industry && (
              <>
                <span className="h-3 border-l border-slate-300" />
                <span>Industry: {industry}</span>
              </>
            )}
            <span className="h-3 border-l border-slate-300" />
            <span>Terms: {account.terms || "-"}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {metrics.map((metric) => (
          <KpiCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            icon={metric.Icon}
            accent={metric.color}
            change={metric.change}
            changePositive={metric.positive}
            changeLabel={metric.changeLabel}
            chart={metric.chart}
            footnote={metric.footnote}
            title={metric.tooltip}
          />
        ))}
      </div>
    </section>
  );
}
