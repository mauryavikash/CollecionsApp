"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, X } from "lucide-react";

const formatCurrency = (value) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
}).format(Number(value ?? 0));

export default function AuditEventDetails({ data, riskDistribution }) {
  const details = [
    ["Case ID", data?.caseId ?? "-"],
    ["Invoice", data?.invoiceNumber ?? "-"],
    ["Vendor", data?.vendor || "-"],
    ["Exposure (USD)", formatCurrency(data?.exposureAmount)],
  ];
  const risks = Array.isArray(riskDistribution) ? riskDistribution : [];

  return (
    <section className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Case / Invoice / Vendor</h2>
        <dl className="mt-4 space-y-2 text-[10px]">{details.map(([label, value]) => <div key={label} className="grid grid-cols-[88px_1fr] gap-2"><dt className="text-slate-500">{label}</dt><dd className={label === "Exposure (USD)" ? "font-semibold text-slate-800" : "font-medium text-blue-600"}>{value}</dd></div>)}</dl>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Risk &amp; Confidence Overview</h2>
        <p className="mt-4 text-[10px] font-semibold text-slate-700">Risk Level (by Events)</p>
        <div className="mt-3 space-y-3">
          {risks.map((risk) => {
            const score = Number(risk.percentage ?? 0);
            const color = risk.riskLevel === "CRITICAL" ? "bg-red-500" : risk.riskLevel === "HIGH" ? "bg-orange-500" : "bg-emerald-500";
            const label = risk.riskLevel === "CRITICAL" ? "High Risk" : `${risk.riskLevel[0]}${risk.riskLevel.slice(1).toLowerCase()} Risk`;

            return <div key={risk.riskLevel} className="grid grid-cols-[70px_1fr_76px] items-center gap-2 text-[10px]">
              <span className="text-slate-600">{label}</span>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} /></div>
              <span className="text-right text-slate-600">{risk.count} ({score}%)</span>
            </div>;
          })}
        </div>
        <Link href="/audit" className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600">View details <ArrowRight size={13} /></Link>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Decision</h2>
        <dl className="mt-4 space-y-2 text-[10px]"><div className="grid grid-cols-[64px_1fr] gap-2"><dt className="text-slate-500">Outcome</dt><dd className="font-semibold text-slate-800">True Duplicate</dd></div><div className="grid grid-cols-[64px_1fr] gap-2"><dt className="text-slate-500">Action Taken</dt><dd className="text-slate-700">Confirmed Duplicate</dd></div><div className="grid grid-cols-[64px_1fr] gap-2"><dt className="text-slate-500">Reason</dt><dd className="text-slate-700">Exact match on key invoice fields. Duplicate identified.</dd></div></dl>
        <div className="mt-4 border-t border-slate-100 pt-3"><p className="text-[10px] font-semibold text-slate-700">Linked Events (4)</p><div className="mt-2 space-y-1.5 text-[10px] text-slate-600"><p className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-blue-600" /> Detection by Rule R1</p><p className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-violet-600" /> AI Recommendation</p><p className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-emerald-600" /> User Decision (This Event)</p></div></div>
        <Link href="/cases" className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800">Open Related Case <ArrowRight size={13} /></Link>
      </article>
    </section>
  );
}
