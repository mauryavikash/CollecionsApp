"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useState } from "react";

const panel = "rounded-lg border border-slate-200 bg-white p-4 shadow-sm";
const colors = ["#e63946", "#f59e0b", "#fbbf24", "#16a34a", "#64748b"];

export default function VendorExposureAnalytics({ data }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const tabs = Array.isArray(data?.tabs) ? data.tabs.map((tab) => tab.name) : [];
  const exposureTrend = Array.isArray(data?.exposureTrend)
    ? data.exposureTrend.map((item) => ({ month: item.period, value: Number(item["exposure Value"] ?? 0) }))
    : [];
  const findings = Array.isArray(data?.findingsDistribution)
    ? data.findingsDistribution.map((item, index) => ({ name: item.findingType, value: Number(item.value ?? 0), color: colors[index % colors.length] }))
    : [];
  const currencyUsage = Array.isArray(data?.currencyUsage)
    ? data.currencyUsage.map((item) => ({ name: item.currency, vendor: Number(item.vendorPercentage ?? 0), peers: Number(item.peerPercentage ?? 0) }))
    : [];
  const totalFindings = findings.reduce((total, item) => total + item.value, 0);

  return (
    <section className="mt-4 overflow-hidden">
      {/* <div className="overflow-x-auto border-b border-slate-200">
        <div className="flex min-w-max px-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-3 py-3 text-[10px] font-medium transition-colors ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-slate-700 hover:text-blue-600"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div> */}
      <div className="grid gap-4 lg:grid-cols-3">
      <article className={panel}>
        <h2 className="text-xs font-semibold text-slate-900">Exposure Trend (USD)</h2>
        <div className="mt-3 h-36"><ResponsiveContainer width="100%" height="100%"><LineChart data={exposureTrend} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e2e8f0" /><XAxis dataKey="month" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}M`} /><Tooltip formatter={(value) => `$${value}M`} /><Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={{ r: 3, fill: "#2563eb" }} /></LineChart></ResponsiveContainer></div>
        <Link href="/reports" className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800">View full trend <ArrowRight size={13} /></Link>
      </article>

      <article className={panel}>
        <h2 className="text-xs font-semibold text-slate-900">Exposure by Finding Type (USD)</h2>
        <div className="mt-3 grid grid-cols-[164px_minmax(0,1fr)] items-center gap-4"><div className="relative h-40 w-40 shrink-0"><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="whitespace-nowrap text-xl font-bold text-slate-900">{totalFindings.toLocaleString()}</span><span className="mt-0.5 text-[9px] text-slate-500">Total Findings</span></div><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={findings} dataKey="value" innerRadius={45} outerRadius={67} paddingAngle={2} stroke="none">{findings.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie></PieChart></ResponsiveContainer></div><div className="min-w-0 space-y-2.5 text-[10px]">{findings.map((item) => <div key={item.name} className="flex gap-1.5"><span className="mt-1 h-2 w-2 shrink-0 rounded-sm" style={{ backgroundColor: item.color }} /><span className="leading-4 text-slate-600">{item.name}<br /><b className="whitespace-nowrap text-slate-800">{item.value.toLocaleString()} ({totalFindings ? ((item.value / totalFindings) * 100).toFixed(1) : "0.0"}%)</b></span></div>)}</div></div>
        <Link href="/cases" className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800">View all findings <ArrowRight size={13} /></Link>
      </article>

      <article className={panel}>
        <div className="flex items-center justify-between"><h2 className="text-xs font-semibold text-slate-900">Currency Usage vs Peers</h2><div className="flex gap-3 text-[9px] text-slate-600"><span><i className="mr-1 inline-block h-2 w-2 rounded-sm bg-violet-700" />This Vendor</span><span><i className="mr-1 inline-block h-2 w-2 rounded-sm bg-slate-400" />Peer Avg.</span></div></div>
        <div className="mt-3 h-36"><ResponsiveContainer width="100%" height="100%"><BarChart data={currencyUsage} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e2e8f0" /><XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} /><Tooltip formatter={(value) => `${value}%`} /><Bar dataKey="vendor" fill="#6d28d9" radius={[2, 2, 0, 0]} /><Bar dataKey="peers" fill="#94a3b8" radius={[2, 2, 0, 0]} /></BarChart></ResponsiveContainer></div>
        <Link href="/reports" className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800">View currency analysis <ArrowRight size={13} /></Link>
      </article>
      </div>
    </section>
  );
}
