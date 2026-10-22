"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartLine, ChevronDown, ListFilter, Target, Users, ChartPie } from "lucide-react";

export const PERIOD_OPTIONS = [
  { value: 3, label: "Last 3 Months" },
  { value: 6, label: "Last 6 Months" },
  { value: 12, label: "Last 12 Months" },
];

const TOOLTIP_STYLE = { borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 11, boxShadow: "0 6px 16px rgba(15,23,42,.08)" };

function Panel({ children, className = "" }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_2px_6px_rgba(38,82,144,.08)] ${className}`}>
      {children}
    </section>
  );
}

function PanelTitle({ icon: Icon, title, subtitle, iconClass = "bg-blue-600 text-white", children }) {
  return (
    <div className="mb-2 flex items-start justify-between gap-2">
      <div className="flex items-start gap-2.5">
        {Icon && (
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${iconClass}`}>
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div>
          <h2 className="text-[14px] font-bold text-slate-800">{title}</h2>
          {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export function PeriodSelect({ value, onChange, className = "" }) {
  return (
    <label className={`relative inline-flex ${className}`}>
      <span className="sr-only">Period</span>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-8 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-[12px] font-semibold text-blue-700 outline-none focus:border-blue-500"
      >
        {PERIOD_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
    </label>
  );
}

function TrendTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] shadow-lg">
      <p className="mb-1 font-bold text-slate-800">{row.fullLabel}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="flex items-center gap-1.5 text-slate-600">
          <i className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
          {item.name}: <b className="text-slate-800">{item.value}</b>
        </p>
      ))}
    </div>
  );
}

function rateClass(rate) {
  if (rate >= 85) return "text-green-600";
  if (rate >= 70) return "text-orange-500";
  return "text-red-500";
}

export default function PtpCharts({ analytics, period, onPeriodChange }) {
  const { trend, fulfillmentTrend, statusDistribution, aging, topCollectors, total } = analytics;
  const maxKept = Math.max(1, ...topCollectors.map((collector) => collector.kept));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <Panel>
          <PanelTitle icon={ChartLine} title="PTP Trend" subtitle="Total PTP, Kept, Active and Broken by promise month">
            <PeriodSelect value={period} onChange={onPeriodChange} />
          </PanelTitle>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                  width={42}
                  allowDecimals={false}
                  label={{ value: "Number of PTP", angle: -90, position: "insideLeft", offset: 12, style: { fontSize: 10, fill: "#64748b", textAnchor: "middle" } }}
                />
                <Tooltip content={<TrendTooltip />} />
                <Legend itemSorter={null} iconType="square" iconSize={9} wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
                <Line dataKey="totalPtp" name="Total PTP" stroke="#2563eb" strokeWidth={2} dot={{ r: 3.5 }} />
                <Line dataKey="ptpKept" name="PTP Kept" stroke="#22c55e" strokeWidth={2} dot={{ r: 3.5 }} />
                <Line dataKey="active" name="Active" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3.5 }} />
                <Line dataKey="ptpBroken" name="PTP Broken" stroke="#ef4444" strokeWidth={2} dot={{ r: 3.5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <PanelTitle icon={ListFilter} iconClass="text-blue-700" title="PTP Status Distribution" />
          <div className="flex flex-col items-center gap-4 py-2 sm:min-h-[220px] sm:flex-row">
            <div className="relative h-[180px] w-[180px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(value, name, item) => [`${value} (${item?.payload?.pct}%)`, item?.payload?.label]}
                    contentStyle={TOOLTIP_STYLE}
                  />
                  <Pie data={statusDistribution} dataKey="value" nameKey="label" innerRadius={58} outerRadius={86} startAngle={90} endAngle={-270} stroke="none">
                    {statusDistribution.map((entry) => (
                      <Cell key={entry.label} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[22px] font-bold text-slate-800">{total.toLocaleString("en-US")}</span>
                <span className="text-[11px] text-slate-500">Total PTP</span>
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              {statusDistribution.map((item) => (
                <p key={item.label} className="flex items-center gap-2.5 text-[13px]">
                  <i className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="flex-1 text-slate-600">{item.label}</span>
                  <span className="font-medium text-slate-800">
                    {item.value} ({item.pct}%)
                  </span>
                </p>
              ))}
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelTitle icon={ChartPie} iconClass="text-blue-700" title="PTP Aging" subtitle="Open PTPs by days past promise date" />
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aging} margin={{ top: 18, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#475569" }} tickLine={false} axisLine={false} interval={0} />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                  width={42}
                  allowDecimals={false}
                  label={{ value: "Number of PTP", angle: -90, position: "insideLeft", offset: 12, style: { fontSize: 10, fill: "#64748b", textAnchor: "middle" } }}
                />
                <Tooltip cursor={{ fill: "#f1f5f9" }} contentStyle={TOOLTIP_STYLE} formatter={(value) => [value, "PTPs"]} />
                <Bar dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={56}>
                  {aging.map((entry) => (
                    <Cell key={entry.label} fill={entry.color} />
                  ))}
                  <LabelList dataKey="value" position="top" style={{ fontSize: 12, fontWeight: 700, fill: "#0f172a" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Panel>
          <PanelTitle icon={Target} iconClass="text-blue-700" title="PTP Fulfillment Rate Trend" subtitle="Fulfilled + partial PTPs as % of PTPs due each month" />
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fulfillmentTrend} margin={{ top: 20, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="ptpRateFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} width={40} />
                <Tooltip formatter={(value) => [`${value}%`, "Fulfillment Rate"]} labelFormatter={(_, items) => items?.[0]?.payload?.fullLabel} contentStyle={TOOLTIP_STYLE} />
                <Area
                  dataKey="rate"
                  type="linear"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#ptpRateFill)"
                  dot={{ r: 3.5, fill: "#2563eb", strokeWidth: 0 }}
                  isAnimationActive={false}
                  label={{ position: "top", formatter: (value) => `${value}%`, fontSize: 11, fontWeight: 700, fill: "#0f172a" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <PanelTitle icon={Users} iconClass="text-blue-700" title="Top 5 Collectors by PTP Kept" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[460px] text-[12px]">
              <thead>
                <tr className="bg-slate-50 text-[12px] text-slate-500">
                  <th className="px-2 py-1.5 text-left font-medium" colSpan={2}>Collector</th>
                  <th className="px-2 py-1.5 text-center font-medium">PTP Kept</th>
                  <th className="px-2 py-1.5 text-center font-medium">Fulfillment Rate</th>
                </tr>
              </thead>
              <tbody>
                {topCollectors.map((collector) => (
                  <tr key={collector.name} className="border-t border-slate-100">
                    <td className="py-2 pl-2 pr-3">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: collector.color }}>
                          {collector.initials}
                        </span>
                        <span className="font-medium text-slate-700">{collector.name}</span>
                      </div>
                    </td>
                    <td className="w-[45%] py-2 pr-3">
                      <div className="h-2.5 rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400" style={{ width: `${(collector.kept / maxKept) * 100}%` }} />
                      </div>
                    </td>
                    <td className="py-2 text-center font-medium text-slate-700">{collector.kept}</td>
                    <td className={`py-2 text-center font-semibold ${rateClass(collector.rate)}`}>{collector.rate}%</td>
                  </tr>
                ))}
                {!topCollectors.length && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">No collector data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
