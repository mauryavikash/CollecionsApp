"use client";

import { Banknote, CircleCheck, Clock3, Handshake, PieChart, TriangleAlert } from "lucide-react";
import KpiCard from "@/components/common/KpiCard";
import { formatCompactCurrency } from "@/utils/helpers";

const CARD_STYLES = {
  total: { Icon: Handshake, color: "#2563eb" },
  fulfilled: { Icon: CircleCheck, color: "#16a34a" },
  dueSoon: { Icon: Clock3, color: "#f97316" },
  partial: { Icon: PieChart, color: "#7c3aed" },
  broken: { Icon: TriangleAlert, color: "#ef4444" },
  amount: { Icon: Banknote, color: "#0d9488" },
};

function toChange(change) {
  if (change === null || change === undefined || !Number.isFinite(change)) return null;
  const digits = Number.isInteger(change) ? 0 : 1;
  return { text: `${change >= 0 ? "+" : "-"}${Math.abs(change).toFixed(digits)}%`, up: change >= 0 };
}

export default function PtpKpiCards({ kpis = [] }) {
  return (
    <section className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {kpis.map((kpi) => {
        const style = CARD_STYLES[kpi.id] ?? CARD_STYLES.total;
        const change = toChange(kpi.change);
        const tone = kpi.sentiment ?? (change ? ((kpi.higherIsWorse ? !change.up : change.up) ? "positive" : "negative") : null);
        const spark = (kpi.spark ?? []).map(Number);
        const isAmount = kpi.id === "amount";
        const chart = spark.length > 1
          ? {
              type: "bar",
              color: style.color,
              height: 40,
              data: spark.map((value, index) => ({
                label: kpi.sparkLabels?.[index] ?? `Month ${index + 1}`,
                value,
                display: isAmount ? formatCompactCurrency(value) : `${value.toLocaleString("en-US")} promises`,
                color: index === spark.length - 1 ? style.color : `${style.color}80`,
              })),
            }
          : null;

        return (
          <KpiCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            icon={style.Icon}
            accent={style.color}
            change={change}
            changePositive={tone !== "negative"}
            changeLabel={kpi.comparison}
            chart={chart}
            footnote={kpi.previousText}
            title={kpi.definition}
          />
        );
      })}
    </section>
  );
}
