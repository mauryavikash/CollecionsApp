"use client";

import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const panel = "rounded-[10px] border border-[#D9E1EA] bg-white p-4 shadow-[0px_1px_4px_rgba(15,23,42,0.05)]";

const chartColors = ["#3B82F6", "#F59E0B", "#10B981", "#7C3AED", "#EC4899"];

export default function RecoveriesCharts({ summary, trend, vendors }) {
  const summaryData = Array.isArray(summary)
    ? summary.map((item, index) => ({
        name: item.recoveryType,
        value: Number(item.value ?? 0),
        percent: `${item.percent ?? 0}%`,
        color: chartColors[index % chartColors.length],
      }))
    : [];
  const trendData = Array.isArray(trend)
    ? trend.map((item) => ({ name: item.date, value: Number(item.value ?? 0) }))
    : [];
  const vendorData = Array.isArray(vendors)
    ? vendors.map((item) => ({ name: item.vendor || "Unassigned", value: Number(item.recoveryValue ?? 0) }))
    : [];
  const maxVendorValue = Math.max(...vendorData.map((vendor) => vendor.value), 1);
  const total = summaryData.reduce((sum, item) => sum + item.value, 0);
  return <div className="flex flex-1"><div className="grid w-full grid-cols-1 items-stretch gap-3 md:grid-cols-3">
    <div className={`${panel} h-full`}><h3 className="text-[13px] font-semibold text-[#0F172A]">Recovery Summary by Type</h3><div className="mt-2 flex items-center gap-3"><div className="relative h-[110px] w-[110px] shrink-0"><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="text-[15px] font-extrabold text-[#0F172A]">${total.toFixed(2)}M</span><span className="text-[9px] font-semibold uppercase tracking-wide text-[#94A3B8]">Total</span></div><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={summaryData} dataKey="value" innerRadius={36} outerRadius={53} paddingAngle={2}>{summaryData.map((item) => <Cell key={item.name} fill={item.color} stroke="none" />)}</Pie></PieChart></ResponsiveContainer></div><div className="space-y-2 text-[10px]">{summaryData.map((item) => <div key={item.name}><span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name}<p className="font-semibold text-[#0F172A]">${item.value.toFixed(2)}M ({item.percent})</p></div>)}</div></div></div>
    <div className={`${panel} h-full`}><div className="flex justify-between"><div><h3 className="text-[13px] font-semibold text-[#0F172A]">Recovery Trend (USD)</h3></div><select className="h-7 rounded-lg border border-[#D9E1EA] px-2 text-[10px]"><option>Daily</option><option>Weekly</option></select></div><div className="mt-2 h-[130px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}><XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => `$${Number(value).toFixed(2)}M`} /><Area type="monotone" dataKey="value" stroke="#2563EB" fill="#BFDBFE" /></AreaChart></ResponsiveContainer></div></div>
    <div className={`${panel} h-full`}><h3 className="text-[13px] font-semibold text-[#0F172A]">Top Vendors by Recovery Value</h3><div className="mt-3 space-y-2.5">{vendorData.map((vendor) => <div key={vendor.name} className="flex items-center gap-2"><span className="w-[110px] truncate text-[11px] text-[#475569]">{vendor.name}</span><div className="h-[6px] flex-1 overflow-hidden rounded-full bg-[#F1F5F9]"><div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${(vendor.value / maxVendorValue) * 100}%` }} /></div><span className="w-10 text-right text-[11px] font-semibold">${(vendor.value / 1000).toFixed(0)}K</span></div>)}</div></div>
  </div></div>;
}
