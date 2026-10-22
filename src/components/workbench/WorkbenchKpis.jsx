import { ArrowDown, ArrowUp, CalendarDays, ChartColumn, Coins, Handshake, TriangleAlert } from "lucide-react";

const CARD_CONFIG = {
  "total overdue": { Icon: Coins, tile: "bg-sky-100 text-sky-600", card: "border-sky-300 bg-gradient-to-br from-white to-sky-50" },
  "high risk": { Icon: TriangleAlert, tile: "bg-red-100 text-red-500", card: "border-red-300 bg-gradient-to-br from-white to-red-50" },
  "active ptp": { Icon: Handshake, tile: "bg-teal-100 text-teal-600", card: "border-teal-300 bg-gradient-to-br from-white to-teal-50" },
  "avg dpd": { Icon: ChartColumn, tile: "bg-indigo-100 text-indigo-600", card: "border-indigo-300 bg-gradient-to-br from-white to-indigo-50" },
};

function getConfig(label = "") {
  const key = label.toLowerCase();
  return (
    Object.entries(CARD_CONFIG).find(([match]) => key.includes(match))?.[1] ?? {
      Icon: ChartColumn,
      tile: "bg-slate-100 text-slate-600",
      card: "border-slate-200 bg-white",
    }
  );
}

export default function WorkbenchKpis({ kpis = [], asOf }) {
  return (
    <section className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const config = getConfig(kpi.label);
        const Icon = config.Icon;
        const hasTrend = kpi.trend != null && kpi.trend !== "";
        const Arrow = kpi.trendDirection === "up" ? ArrowUp : ArrowDown;
        return (
          <article key={kpi.label} className={`flex min-h-[112px] gap-3 rounded-xl border px-4 py-3 shadow-[0_2px_6px_rgba(38,82,144,.08)] ${config.card}`}>
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${config.tile}`}>
              <Icon className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-0.5">
                <p className="text-[14px] font-semibold text-slate-800">{kpi.label}</p>
                {asOf && (
                  <span className="inline-flex items-center gap-1 whitespace-nowrap text-[11px] text-slate-600">
                    <CalendarDays className="h-3.5 w-3.5" /> As of {asOf}
                  </span>
                )}
              </div>
              <p className={`break-words text-[22px] font-bold leading-8 sm:text-[26px] ${kpi.label.toLowerCase().includes("risk") ? "text-red-500" : "text-slate-900"}`}>{kpi.value}</p>
              <div className="flex flex-wrap items-end justify-between gap-2">
                {kpi.supporting && <p className="text-[12px] text-slate-600">{kpi.supporting}</p>}
                {hasTrend && (
                  <p className={`flex items-center gap-1 text-[12px] font-semibold ${kpi.positive ? "text-green-600" : "text-red-500"}`}>
                    <Arrow className="h-3.5 w-3.5" /> {kpi.trend}
                    <span className="font-normal text-slate-500">vs prior period</span>
                  </p>
                )}
                {kpi.badge && <span className="rounded-md bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">{kpi.badge}</span>}
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
