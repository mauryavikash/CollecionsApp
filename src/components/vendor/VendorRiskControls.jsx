"use client";

import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

const driverColors = ["bg-red-500", "bg-orange-400", "bg-amber-400", "bg-yellow-400", "bg-emerald-500"];

export default function VendorRiskControls({ data }) {
  const riskDrivers = Array.isArray(data)
    ? data.map((item, index) => [item.driver, Number(item.score ?? 0), driverColors[index % driverColors.length]])
    : [];
  const riskScore = riskDrivers.length
    ? Math.round(riskDrivers.reduce((total, [, score]) => total + score, 0) / riskDrivers.length)
    : 0;
  return (
    <section className="mt-4 grid gap-4 md:grid-cols-3">
      <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-xs font-semibold text-slate-900">Vendor Risk Profile</h2>
        <div className="relative mx-auto mt-4 h-36 w-56 overflow-hidden">
          <div className="absolute inset-x-5 top-0 h-28 rounded-t-full border-[13px] border-slate-200 border-b-0" />
          <div className="absolute left-5 top-0 h-28 w-[calc(50%_-_20px)] rounded-tl-full border-l-[13px] border-t-[13px] border-red-500" />
          <div className="absolute inset-x-0 top-10 text-center">
            <div className="text-4xl font-bold text-red-500">{riskScore}</div>
            <div className="mt-1 text-xs font-semibold text-slate-800">High Risk</div>
          </div>
          <span className="absolute bottom-0 left-0 text-[10px] font-semibold text-slate-500">0</span>
          <span className="absolute bottom-0 right-0 text-[10px] font-semibold text-slate-500">100</span>
        </div>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-xs font-semibold text-slate-900">Risk Drivers</h2>
        <div className="mt-4 space-y-3">
          {riskDrivers.map(([label, score, color]) => (
            <div key={label} className="grid grid-cols-[1.4fr_1fr_24px] items-center gap-2 text-[11px]">
              <span className="text-slate-600">{label}</span>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} /></div>
              <span className="text-right font-semibold text-slate-700">{score}</span>
            </div>
          ))}
        </div>
        <Link href="/vendor" className="mt-5 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800">View full risk breakdown <ArrowRight size={13} /></Link>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-xs font-semibold text-slate-900">Vendor Watch &amp; Controls</h2>
        <div className="mt-4 space-y-3 text-[11px]">
          <div className="flex items-center justify-between"><span className="text-slate-600">Watchlist</span><span className="rounded bg-emerald-50 px-2 py-1 font-medium text-emerald-700">On Watchlist</span></div>
          <div className="flex items-center justify-between"><span className="text-slate-600">Risk Rating</span><span className="flex text-amber-400"><Star size={15} fill="currentColor" /><Star size={15} fill="currentColor" /><Star size={15} fill="currentColor" /><Star size={15} fill="currentColor" /><Star size={15} className="text-slate-300" /></span></div>
          <div className="flex justify-between"><span className="text-slate-600">Last Review</span><span className="font-medium text-slate-800">Apr 18, 2025</span></div>
          <div className="flex justify-between"><span className="text-slate-600">Next Review</span><span className="font-medium text-slate-800">Jul 18, 2025</span></div>
          <div className="border-t border-slate-100 pt-3"><span className="text-slate-600">Controls Applied</span><p className="mt-1 leading-4 text-slate-700">Duplicate Check, Amount Check, Currency Check</p></div>
        </div>
        <Link href="/settings" className="mt-5 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800">Manage Vendor Controls <ArrowRight size={13} /></Link>
      </article>
    </section>
  );
}
