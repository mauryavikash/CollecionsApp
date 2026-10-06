import { AlertCircle, BarChart3, DollarSign, Signal } from "lucide-react";

const DEFAULT_TYPES = ["sparkline", "aging", "risk", "ptp", "recovery"];

const KPI_ICONS = {
  sparkline: DollarSign,
  aging: AlertCircle,
  risk: AlertCircle,
  ptp: Signal,
  recovery: BarChart3,
};

const KPI_TONES = {
  sparkline: { iconBg: "#ecfdf5", iconColor: "#059669" },
  aging: { iconBg: "#fff1f2", iconColor: "#f43f5e" },
  risk: { iconBg: "#fffbeb", iconColor: "#d97706" },
  ptp: { iconBg: "#ecfdf5", iconColor: "#059669" },
  recovery: { iconBg: "#eff6ff", iconColor: "#2563eb" },
};

function normalizeMetric(metric, index) {
  const type = metric?.type ?? DEFAULT_TYPES[index] ?? "sparkline";
  return {
    ...metric,
    type,
  };
}

export default function CollectionKpiCard({ kpis = [] }) {
  const metrics = (kpis ?? []).map((metric, index) => normalizeMetric(metric, index));

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {metrics.map((metric, index) => (
        <DashboardKpi key={`${metric?.label ?? "kpi"}-${index}`} metric={metric} />
      ))}
    </section>
  );
}

function DashboardKpi({ metric }) {
  const Icon = KPI_ICONS[metric?.type] ?? DollarSign;
  const tone = KPI_TONES[metric?.type] ?? KPI_TONES.sparkline;

  const valueColor =
    metric?.type === "aging"
      ? "text-[#f15258]"
      : metric?.type === "risk"
        ? "text-[#e88825]"
        : metric?.type === "ptp"
          ? "text-emerald-600"
          : metric?.type === "recovery"
            ? "text-emerald-600"
          : "text-slate-800";

  const barColors =
    metric?.type === "aging"
      ? ["#4bc173", "#9bd138", "#ffd12a", "#fb9337", "#f15a63"]
      : metric?.type === "recovery"
        ? ["#48bb77", "#48bb77", "#48bb77", "#b5daf8", "#b5daf8", "#b5daf8"]
        : ["#d5ebfc", "#bcddfa", "#a7d1f4", "#2367bd", "#2367bd", "#2367bd", "#2367bd"];

  const values = metric?.values ?? [];
  const activeText = `${metric?.active ?? ""}`.trim();
  const brokenText = `${metric?.broken ?? ""}`.trim();
  const hasActiveNumber = /^\d/.test(activeText);
  const hasBrokenNumber = /^\d/.test(brokenText);
  const sparkline =
    metric?.type === "sparkline"
      ? values.map((value, index) => `${index * 14},${34 - Number(value ?? 0)}`).join(" ")
      : null;

  return (
    <article className="relative h-[82px] overflow-hidden rounded-[10px] border-2 border-[#2858c5] border-b-[#13c4c8] bg-white px-2.5 py-2 shadow-[0_2px_5px_rgba(38,82,144,.12)]">
      <div className="flex justify-between gap-2">
        <p className="text-[10px] font-semibold leading-3 text-slate-600">{metric?.label}</p>

        <span
          className="grid h-5 w-5 shrink-0 place-items-center rounded-md"
          style={{ backgroundColor: tone?.iconBg }}
        >
          <Icon size={12} style={{ color: tone?.iconColor }} />
        </span>
      </div>

      <p className={`mt-1 text-[18px] font-bold leading-5 ${valueColor}`}>
        {metric?.value}
        {metric?.type === "recovery" && (
          <small className="ml-1 text-[8px] font-medium text-slate-500">/ 7 Days</small>
        )}
      </p>

      {metric?.type === "ptp" ? (
        <p className="mt-0.5 text-[8px]">
          <b className="text-emerald-600">
            {hasActiveNumber ? `${activeText} Active` : activeText}
          </b>
          <b className="ml-2 text-amber-600">
            {hasBrokenNumber ? `${brokenText} Broken` : brokenText}
          </b>
        </p>
      ) : metric?.type === "recovery" ? (
        <p className="text-[10px] font-bold text-blue-600">
          {metric?.secondaryValue}
          <small className="ml-1 text-[8px] font-medium text-slate-500">/ 30 Days</small>
        </p>
      ) : metric?.type === "risk" ? (
        <p className="mt-1 text-[8px] text-[#f15258]">{metric?.context}</p>
      ) : (
        <p
          className={`mt-1 text-[8px] font-semibold ${
            metric?.type === "aging" ? "text-[#f15258]" : "text-emerald-600"
          }`}
        >
          {metric?.trend}
          <span className="ml-1 font-medium text-slate-400">{metric?.context}</span>
        </p>
      )}

      {metric?.type === "risk" && (
        <div className="absolute bottom-2 right-2 flex gap-1.5 text-[8px] font-semibold">
          {values.map((risk, index) => (
            <span key={`${risk?.color ?? "risk"}-${index}`} className="flex items-center gap-0.5">
              <i className="h-2 w-2 rounded-sm" style={{ backgroundColor: risk?.color }} />
              {risk?.value}
            </span>
          ))}
        </div>
      )}

      {sparkline && (
        <svg
          className="absolute bottom-2 right-2 h-9 w-[68px]"
          viewBox="0 0 57 36"
          aria-label="Accounts receivable trend"
        >
          <polyline points={sparkline} fill="none" stroke="#51ba7a" strokeWidth="1.4" />
          {values.map((value, index) => (
            <circle
              key={`${value}-${index}`}
              cx={index * 14}
              cy={34 - Number(value ?? 0)}
              r="1.8"
              fill="#51ba7a"
            />
          ))}
        </svg>
      )}

      {(metric?.type === "aging" || metric?.type === "ptp" || metric?.type === "recovery") && (
        <div className="absolute bottom-2 right-2 flex h-6 items-end gap-0.5">
          {values.map((value, index) => (
            <span
              key={`${value}-${index}`}
              className="w-2 rounded-sm"
              style={{
                height: `${Math.min(Math.max(Number(value ?? 0), 2), 22)}px`,
                backgroundColor: barColors[index % barColors.length],
              }}
            />
          ))}
        </div>
      )}
    </article>
  );
}
