"use client";

import { ChartColumn, Coins, Handshake, TriangleAlert } from "lucide-react";
import KpiCard from "@/components/common/KpiCard";

const CARD_CONFIG = {
  "total overdue": { Icon: Coins, accent: "#0284c7" },
  "high risk": { Icon: TriangleAlert, accent: "#ef4444" },
  "active ptp": { Icon: Handshake, accent: "#0d9488" },
  "avg dpd": { Icon: ChartColumn, accent: "#4f46e5" },
};

function getConfig(label = "") {
  const key = label.toLowerCase();
  return Object.entries(CARD_CONFIG).find(([match]) => key.includes(match))?.[1] ?? { Icon: ChartColumn, accent: "#475569" };
}

export default function WorkbenchKpis({ kpis = [], asOf }) {
  return (
    <section className="mt-3 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const config = getConfig(kpi.label);
        return (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            icon={config.Icon}
            accent={config.accent}
            change={kpi.trend ? { text: kpi.trend, up: kpi.trendDirection === "up" } : null}
            changePositive={kpi.positive}
            changeLabel={kpi.trend ? kpi.trendLabel ?? "vs prior period" : "Prior-period comparison not available"}
            chart={kpi.chart}
            dateLabel={kpi.dateLabel ?? (asOf ? `As of ${asOf}` : null)}
            badge={kpi.badge}
            footnote={[kpi.supporting, kpi.previous].filter(Boolean).join(" • ")}
            title={[kpi.dateLabel ?? (asOf && `As of ${asOf}`), kpi.badge].filter(Boolean).join(" • ") || undefined}
          />
        );
      })}
    </section>
  );
}
