import React from "react";
import {
  ShieldCheck,
  Users,
  CircleDollarSign,
  TrendingUp,
  History,
  BadgeCheck,
} from "lucide-react";

const visualConfig = [
  {
    icon: ShieldCheck,
  },
  {
    icon: Users,
  },
  {
    icon: CircleDollarSign,
  },
  {
    icon: TrendingUp,
  },
  {
    icon: History,
  },
  {
    icon: BadgeCheck,
  },
];

export const AuditInsight = ({ data }) => {
  const insights = Array.isArray(data)
    ? data.map((item, index) => {
        const isCurrency = item.metric === "Duplicate Recovery Identified";
        return {
          ...(visualConfig[index] ?? visualConfig[0]),
          label: item.metric,
          value: isCurrency
            ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(Number(item.value ?? 0))
            : `${item.value ?? 0}%`,
          trend: item.trend === undefined ? null : `${Number(item.trend) >= 0 ? "+" : ""}${item.trend}%`,
        };
      })
    : [];

  return (
    <div className="w-full bg-white rounded-[16px] border border-[#D9E1EA] shadow-[0px_2px_8px_rgba(15,23,42,0.05)] p-5">
      <h2 className="text-[15px] font-semibold text-[#0F172A]">
        Audit Insights
      </h2>

      <div className="mt-4 flex flex-col gap-4">
        {insights.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-[#DBEAFE] flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-[#2563EB]" />
                  </div>
                  <span className="text-[12px] text-[#475569] truncate">
                    {item.label}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[13px] font-bold text-[#0F172A]">
                    {item.value}
                  </div>
                  {item.trend && (
                    <div className="text-[11px] font-medium text-[#10B981]">
                      ↑ {item.trend}
                    </div>
                  )}
                </div>
              </div>

              {index < insights.length - 1 && (
                <div className="mt-4 border-t border-[#F1F5F9]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};