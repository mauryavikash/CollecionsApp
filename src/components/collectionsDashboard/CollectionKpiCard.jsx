"use client";

import { AlertTriangle, ChartColumnIncreasing, Coins, Handshake, Users } from "lucide-react";
import KpiCard, { parseChange } from "@/components/common/KpiCard";
import {
  addDays,
  forecastWeekRange,
  formatCompactMoney,
  formatDay,
  moneyTrendPoints,
  parseIsoDate,
} from "@/components/common/dateRanges";

const DEFAULT_TYPES = ["sparkline", "aging", "risk", "ptp", "recovery"];

const THEME = {
  sparkline: { Icon: Coins, accent: "#0b57d0" },
  aging: { Icon: AlertTriangle, accent: "#e11d48" },
  risk: { Icon: Users, accent: "#ea580c" },
  ptp: { Icon: Handshake, accent: "#16a34a" },
  recovery: { Icon: ChartColumnIncreasing, accent: "#0b57d0" },
};

/* Overdue aging buckets 1-30d ... 181+d: green -> red */
const AGING_COLORS = ["#4bc173", "#9bd138", "#facc15", "#fb9337", "#f15a63"];

function stripTime(text) {
  if (!text) return null;
  return String(text).replace(/^As of\s*/i, "").split(",")[0].trim() || null;
}

function buildChart(metric, { asOfIso, forecast }) {
  const values = metric?.values ?? [];

  switch (metric?.type) {
    case "aging":
      return {
        type: "bar",
        color: "#e11d48",
        data: values.map((value, index) => ({
          label: metric?.labels?.[index] ?? `Bucket ${index + 1}`,
          value: Number(value),
          color: AGING_COLORS[index % AGING_COLORS.length],
          note: "Aging bucket share",
        })),
      };
    case "risk": {
      const breakdown = metric?.hover?.breakdown;
      const rows = Array.isArray(breakdown) && breakdown.length
        ? breakdown.map((row) => ({ label: `${row.label} risk`, value: Number(row.count), color: row.color }))
        : values.map((row, index) => ({ label: `Segment ${index + 1}`, value: Number(row?.value), color: row?.color }));
      return {
        type: "bar",
        color: "#ea580c",
        data: rows.map((row) => ({ ...row, display: `${row.value} accounts` })),
      };
    }
    case "ptp": {
      const end = parseIsoDate(asOfIso);
      return {
        type: "area",
        color: "#16a34a",
        data: values.map((value, index) => ({
          label: end ? formatDay(addDays(end, index - values.length + 1), true) : `Day ${index + 1}`,
          value: Number(value),
          display: `${value} promises`,
        })),
      };
    }
    case "recovery": {
      if (Array.isArray(forecast) && forecast.length) {
        return {
          type: "bar",
          color: "#0b57d0",
          data: forecast.map((week, index) => {
            const raw = Number(week?.projectedRaw ?? Number(week?.projected) * 1e6);
            return {
              label: `${week?.label ?? `Wk ${index + 1}`} · ${forecastWeekRange(asOfIso, index) ?? ""}`,
              value: raw,
              display: `${formatCompactMoney(raw, 2)} projected`,
              color: index === 0 ? "#0b57d0" : "#93bbff",
            };
          }),
        };
      }
      return null;
    }
    default:
      return {
        type: "area",
        color: "#0b57d0",
        data: moneyTrendPoints(metric, asOfIso),
      };
  }
}

export default function CollectionKpiCard({ kpis = [], asOfDate, asOfIso, forecast = [] }) {
  const metrics = (kpis ?? []).map((metric, index) => ({
    ...metric,
    type: metric?.type ?? DEFAULT_TYPES[index] ?? "sparkline",
  }));

  return (
    <section className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {metrics.map((metric, index) => (
        <DashboardKpi
          key={`${metric?.id ?? metric?.label ?? "kpi"}-${index}`}
          metric={metric}
          asOfDate={asOfDate}
          asOfIso={metric?.asOfDate ?? asOfIso}
          forecast={forecast}
        />
      ))}
    </section>
  );
}

function DashboardKpi({ metric, asOfDate, asOfIso, forecast }) {
  const theme = THEME[metric?.type] ?? THEME.sparkline;
  const change = parseChange(metric?.changePct ?? metric?.trend, metric?.changeDirection);
  const sentiment = metric?.changeSentiment ?? metric?.comparison?.sentiment;
  const positive = sentiment ? sentiment === "positive" : change?.up;
  const changeLabel = metric?.changeLabel ?? metric?.hover?.changeLabel ?? "vs last month";
  const previousValue = metric?.previousValue ?? metric?.hover?.previousValue;
  const previousLabel = metric?.previousLabel ?? metric?.hover?.previousLabel;
  const asOfText = stripTime(metric?.asOf) ?? asOfDate;
  const hoverText = [asOfText && `As of ${asOfText}`, metric?.comparisonLabel, metric?.definition]
    .filter(Boolean)
    .join(" • ");

  const footnote = [
    previousValue != null && previousValue !== "" ? `${previousValue} ${previousLabel ?? ""}`.trim() : null,
    metric?.comparisonLabel && metric?.type !== "recovery" ? metric.comparisonLabel : null,
  ]
    .filter(Boolean)
    .join(" • ");

  let extra = null;
  if (metric?.type === "ptp") {
    extra = (
      <div className="mt-2 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] font-semibold @min-[160px]:gap-x-3 @min-[160px]:text-[11px]">
        <span className="text-emerald-600">{metric?.active ?? metric?.open ?? 0} Active</span>
        <span className="text-amber-500">{metric?.broken ?? 0} Broken</span>
        {metric?.amount && <span className="text-slate-500">{metric.amount}</span>}
      </div>
    );
  } else if (metric?.type === "recovery" && metric?.secondaryValue) {
    extra = (
      <div className="mt-2 text-[10px] text-slate-500 @min-[160px]:text-[11px]">
        <span className="font-semibold text-slate-700">{metric.secondaryValue}</span> / {metric?.secondaryPeriod ?? "30 Days"}
      </div>
    );
  } else if (metric?.type === "risk" && metric?.hover?.exposure) {
    extra = (
      <div className="mt-2 text-[10px] text-slate-500 @min-[160px]:text-[11px]">
        <span className="font-semibold text-slate-700">{metric.hover.exposure}</span> exposure
      </div>
    );
  }

  return (
    <KpiCard
      label={metric?.label}
      value={metric?.value}
      valueSuffix={metric?.type === "recovery" && metric?.period ? `/ ${metric.period}` : null}
      icon={theme.Icon}
      accent={theme.accent}
      change={change}
      changePositive={positive}
      changeLabel={changeLabel}
      extra={extra}
      chart={buildChart(metric, { asOfIso, forecast })}
      footnote={footnote || null}
      title={hoverText || undefined}
    />
  );
}
