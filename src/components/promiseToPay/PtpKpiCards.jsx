import { ArrowDown, ArrowUp, CircleCheck, Clock3, Handshake, PieChart, TriangleAlert, Banknote } from "lucide-react";
import { Sparkline } from "@/components/common/MiniCharts";

const CARD_STYLES = {
  total: { Icon: Handshake, color: "#2563eb", tile: "bg-blue-100 text-blue-600", border: "#60a5fa" },
  fulfilled: { Icon: CircleCheck, color: "#16a34a", tile: "bg-green-100 text-green-600", border: "#4ade80" },
  dueSoon: { Icon: Clock3, color: "#f97316", tile: "bg-orange-100 text-orange-500", border: "#fb923c" },
  partial: { Icon: PieChart, color: "#7c3aed", tile: "bg-violet-100 text-violet-600", border: "#a78bfa" },
  broken: { Icon: TriangleAlert, color: "#ef4444", tile: "bg-red-100 text-red-500", border: "#f87171" },
  amount: { Icon: Banknote, color: "#0d9488", tile: "bg-teal-100 text-teal-600", border: "#2dd4bf" },
};

// sentiment (positive | negative | neutral) comes from /ui/ptp-analytics; the
// client-side fallback derives it from the sign and higherIsWorse.
function Change({ change, higherIsWorse, sentiment }) {
  if (change === null || change === undefined || !Number.isFinite(change)) return null;
  const up = change >= 0;
  const tone = sentiment ?? ((higherIsWorse ? !up : up) ? "positive" : "negative");
  const Arrow = up ? ArrowUp : ArrowDown;
  const toneClass = tone === "positive" ? "text-green-600" : tone === "negative" ? "text-red-500" : "text-slate-500";
  const digits = Number.isInteger(change) ? 0 : 1;

  return (
    <span className={`inline-flex items-center gap-0.5 font-semibold ${toneClass}`}>
      <Arrow className="h-3.5 w-3.5" strokeWidth={2.5} />
      {Math.abs(change).toFixed(digits)}%
    </span>
  );
}

export default function PtpKpiCards({ kpis = [] }) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      {kpis.map((kpi) => {
        const style = CARD_STYLES[kpi.id] ?? CARD_STYLES.total;
        const Icon = style.Icon;
        return (
          <article
            key={kpi.id}
            className="flex min-h-[92px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-[0_2px_6px_rgba(38,82,144,.08)]"
            style={{ borderTop: `2px solid ${style.border}` }}
            title={kpi.definition}
          >
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${style.tile}`}>
              <Icon className="h-6 w-6" strokeWidth={2.2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium leading-4 text-slate-700">{kpi.label}</p>
              <div className="flex items-end justify-between gap-1">
                <p className="text-[22px] font-bold leading-7 text-slate-900">{kpi.value}</p>
                <Sparkline values={kpi.spark} color={style.color} width={64} height={28} />
              </div>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px] leading-4 text-slate-500">
                <Change change={kpi.change} higherIsWorse={kpi.higherIsWorse} sentiment={kpi.sentiment} />
                <span>{kpi.comparison}</span>
              </p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
