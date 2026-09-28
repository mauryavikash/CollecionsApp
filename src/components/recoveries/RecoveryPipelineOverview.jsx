"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const panel = "rounded-lg border border-slate-200 bg-white p-3 shadow-sm";
const colorForAge = (value) => value >= 40 ? "bg-orange-400 text-white" : value >= 20 ? "bg-orange-200 text-orange-900" : value >= 10 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800";

const priorityColors = ["#dc2626", "#f97316", "#fbbf24", "#16a34a"];

export default function RecoveryPipelineOverview({ pipeline, aging, priorities, metrics }) {
  const pipelineData = Array.isArray(pipeline) ? pipeline : [];
  const agingData = Array.isArray(aging) ? aging : [];
  const priorityData = Array.isArray(priorities)
    ? priorities.map((item, index) => ({ name: item.priority, value: Number(item.value ?? 0), color: priorityColors[index % priorityColors.length] }))
    : [];
  const maxPipelineAmount = Math.max(...pipelineData.map((item) => Number(item.amount ?? 0)), 1);
  const totalPriorityValue = priorityData.reduce((total, item) => total + item.value, 0);

  return <section className="grid gap-3 md:grid-cols-3">
    <article className={panel}><h2 className="text-xs font-semibold text-slate-900">Recovery Pipeline (By Stage)</h2><div className="mt-4 grid grid-cols-[minmax(110px,1fr)_100px] gap-x-3"><div className="space-y-1.5">{pipelineData.map((item) => <div key={item.stage} className="flex h-5 justify-center"><span className="rounded-sm bg-blue-600" style={{ width: `${(Number(item.amount ?? 0) / maxPipelineAmount) * 100}%` }} /></div>)}</div><div className="space-y-1.5 text-[9px] leading-5 text-slate-700">{pipelineData.map((item) => <div key={item.stage} className="flex justify-between gap-2"><span>{item.stage}</span><span>${Number(item.amount ?? 0).toLocaleString()}</span></div>)}</div></div><div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-[10px] font-semibold"><span>Conversion Rate</span><span>{metrics?.conversionRate ?? 0}%</span></div></article>
    <article className={panel}><h2 className="text-xs font-semibold text-slate-900">Recovery Aging (By Stage)</h2><div className="mt-4 grid gap-1 text-center text-[8px]" style={{ gridTemplateColumns: "88px repeat(5, minmax(0, 1fr))" }}><span />{["0-15", "16-30", "31-60", "61-90", "90+"].map((item) => <span key={item} className="font-medium text-slate-500">{item}</span>)}{agingData.flatMap((item) => [<span key={item.stage} className="self-center text-left text-[9px] font-medium text-slate-700">{item.stage}</span>, ...["0-15", "16-30", "31-60", "61-90", "90+"].map((range) => <span key={`${item.stage}-${range}`} className={`rounded-sm py-1 ${colorForAge(Number(item[range] ?? 0))}`}>{item[range] ?? 0}</span>)])}</div><Link href="/reports" className="mt-4 inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600">View full aging report <ArrowRight size={12} /></Link></article>
    <article className={panel}><h2 className="text-xs font-semibold text-slate-900">Recoveries by Priority</h2><div className="mt-4 flex items-center gap-5"><div className="h-32 w-32 shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={priorityData} dataKey="value" innerRadius={34} outerRadius={53} paddingAngle={2} stroke="none">{priorityData.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie></PieChart></ResponsiveContainer></div><div className="space-y-2 text-[10px]">{priorityData.map((item) => <div key={item.name} className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm" style={{ backgroundColor: item.color }} /><span className="w-11">{item.name}</span><span>${item.value.toFixed(2)}M ({totalPriorityValue ? ((item.value / totalPriorityValue) * 100).toFixed(1) : "0.0"}%)</span></div>)}</div></div><div className="mt-2 flex justify-between border-t border-slate-200 pt-3 text-[10px] font-semibold"><span>Total</span><span>${totalPriorityValue.toFixed(2)}M</span></div><Link href="/recoveries" className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600">View all recoveries <ArrowRight size={12} /></Link></article>
  </section>;
}
