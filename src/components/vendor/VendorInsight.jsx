"use client";
import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ArrowRight, BadgeDollarSign, CreditCard, FileText, History, ReceiptText, WalletCards } from "lucide-react";

const colors = ["#F87171", "#FBBF24", "#3B82F6", "#34D399", "#7C3AED"];

export const VendorInsight = ({ data }) => {
  const severityData = Array.isArray(data?.severityDistribution)
    ? data.severityDistribution.map((item, index) => ({ name: item.severity, value: Number(item.count ?? 0), percent: `${item.percentage ?? 0}%`, color: colors[index % colors.length] }))
    : [];
  const topAlertTypes = Array.isArray(data?.alertTypes)
    ? data.alertTypes.map((item, index) => ({ name: item.type, value: Number(item.count ?? 0), color: colors[index % colors.length] }))
    : [];
  const total = severityData.reduce((sum, item) => sum + item.value, 0);
  const maxAlertType = Math.max(...topAlertTypes.map((item) => item.value), 1);

  return (
    <div className="w-full bg-white rounded-[16px] border border-[#D9E1EA] shadow-[0px_2px_8px_rgba(15,23,42,0.05)] p-5">
      <h2 className="text-[16px] font-semibold text-[#0F172A]">
        Alert Insights
      </h2>

      {/* Severity Donut */}
      <div className="mt-4">
        <p className="text-[13px] text-[#64748B] mb-3">
          Alerts by Severity
        </p>

        <div className="flex justify-center">
          <div className="relative h-[160px] w-[160px] shrink-0">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-extrabold text-[#0F172A]">
                {total}
              </span>
              <span className="text-[11px] font-semibold text-[#94A3B8] tracking-wide uppercase">
                Total
              </span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={54}
                  outerRadius={78}
                  paddingAngle={2}
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2.5 text-[13px]">
          {severityData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[#475569]">{item.name}</span>
              </div>
              <span className="font-medium text-[#334155] shrink-0">
                {item.value} ({item.percent})
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="my-5 border-t border-[#E5E7EB]" />

      {/* Top Alert Types */}
      <div>
        <p className="text-[13px] text-[#64748B] mb-4">
          Top Alert Types
        </p>

        <div className="flex flex-col gap-3.5">
          {topAlertTypes.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <span className="text-[12px] text-[#475569] w-[120px] shrink-0 truncate">
                {item.name}
              </span>

              <div className="flex-1 h-[6px] rounded-full bg-[#F1F5F9] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(item.value / maxAlertType) * 100}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>

              <span className="text-[12px] font-semibold text-[#0F172A] w-4 text-right shrink-0">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="my-5 border-t border-[#E5E7EB]" />

      <button className="w-full flex items-center justify-center gap-2 text-[13px] font-medium text-[#2563EB]">
        <History size={14} />
        View All Insights
      </button>

      <div className="mt-5 border-t border-[#E5E7EB] pt-5">
        <h3 className="text-[13px] font-semibold text-[#0F172A]">Vendor Lifecycle &amp; Payment Chain</h3>
        <div className="mt-4 flex items-start justify-between gap-1">
          <LifecycleStep icon={FileText} label="PO / Contract" value="312" color="text-blue-600" background="bg-blue-50" />
          <ArrowRight size={14} className="mt-3 shrink-0 text-[#64748B]" />
          <LifecycleStep icon={ReceiptText} label="Invoices" value="1,854" color="text-blue-600" background="bg-blue-50" />
          <ArrowRight size={14} className="mt-3 shrink-0 text-[#64748B]" />
          <LifecycleStep icon={CreditCard} label="Credits" value="128" color="text-sky-600" background="bg-sky-50" />
          <ArrowRight size={14} className="mt-3 shrink-0 text-[#64748B]" />
          <LifecycleStep icon={WalletCards} label="Payments" value="1,698" color="text-emerald-600" background="bg-emerald-50" />
          <ArrowRight size={14} className="mt-3 shrink-0 text-[#64748B]" />
          <LifecycleStep icon={BadgeDollarSign} label="Open Items" value="156" color="text-orange-600" background="bg-orange-50" />
        </div>
        <button type="button" className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]">
          View full lifecycle <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};

function LifecycleStep({ icon: Icon, label, value, color, background }) {
  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${background} ${color}`}><Icon size={13} /></span>
      <span className="mt-2 text-[9px] leading-3 text-[#475569]">{label}</span>
      <span className="mt-1 text-[11px] font-semibold text-[#0F172A]">{value}</span>
    </div>
  );
}