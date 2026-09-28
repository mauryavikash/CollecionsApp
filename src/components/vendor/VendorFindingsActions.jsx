"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, CircleAlert, LockKeyhole, ShieldCheck } from "lucide-react";

const panel = "rounded-lg border border-slate-200 bg-white p-4 shadow-sm";
const impactClass = (impact) => impact === "High Impact" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600";

const formatCurrency = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(Number(value ?? 0));

export default function VendorFindingsActions({ issues, findings, actions }) {
  return (
    <section className="mt-4 grid gap-4 lg:grid-cols-3">
      <article className={panel}>
        <h2 className="text-xs font-semibold text-slate-900">Top Issues for This Vendor</h2>
        <div className="mt-4 space-y-3">{(issues ?? []).map((item) => <div key={item.title} className="grid grid-cols-[20px_minmax(0,1fr)_auto] gap-2"><span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-50 text-amber-600"><CircleAlert size={12} /></span><div className="min-w-0"><p className="text-[11px] font-medium text-slate-800">{item.title}</p><p className="mt-0.5 text-[9px] text-slate-500">{item.description}</p></div><div className="text-right"><span className="rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-medium text-amber-600">{item.severity}</span><p className="mt-1 text-[9px] text-slate-500">{item.caseCount} cases</p></div></div>)}</div>
        <Link href="/cases" className="mt-5 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800">View all issues <ArrowRight size={13} /></Link>
      </article>

      <article className={panel}>
        <h2 className="text-xs font-semibold text-slate-900">Recent Findings</h2>
        <div className="mt-4 space-y-3">{(findings ?? []).map((item) => <Link key={item.caseId} href="/cases" className="grid grid-cols-[1.25fr_1.3fr_.7fr_.9fr_1fr] items-center gap-1 text-[9px] hover:text-blue-700"><span className="font-semibold text-blue-600">{item.caseId}</span><span className="rounded bg-violet-50 px-1.5 py-0.5 text-center text-violet-700">{item.findingType}</span><span className={`rounded px-1.5 py-0.5 text-center ${item.severity === "CRITICAL" ? "bg-red-50 text-red-600" : item.severity === "HIGH" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}`}>{item.severity}</span><span className="font-semibold text-slate-700">{formatCurrency(item.amount)}</span><span className="text-slate-500">{new Date(item.detectedDate).toLocaleDateString()}</span></Link>)}</div>
        <Link href="/cases" className="mt-5 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800">View all findings <ArrowRight size={13} /></Link>
      </article>

      <article className={panel}>
        <h2 className="text-xs font-semibold text-slate-900">Recommended Actions (AI)</h2>
        <div className="mt-4 space-y-4">{(actions ?? []).map((item) => <div key={item.action} className="grid grid-cols-[20px_minmax(0,1fr)_auto] gap-2"><span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><ShieldCheck size={12} /></span><div><p className="text-[11px] font-medium text-slate-800">{item.action}</p><p className="mt-0.5 text-[9px] leading-3 text-slate-500">{item.description}</p></div><span className={`h-fit rounded px-1.5 py-0.5 text-[9px] font-medium ${impactClass(item.impact)}`}>{item.impact}</span></div>)}</div>
        <Link href="/cases" className="mt-5 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800">View all recommendations <ArrowRight size={13} /></Link>
      </article>
    </section>
  );
}
