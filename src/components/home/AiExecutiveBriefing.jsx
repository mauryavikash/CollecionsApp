"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";
import { ArrowRight } from "lucide-react";

const trendData = [
  { month: "Oct", value: 10 },
  { month: "Nov", value: 10.2 },
  { month: "Dec", value: 10.4 },
  { month: "Jan", value: 10.6 },
  { month: "Feb", value: 10.8 },
  { month: "Mar", value: 11.1 },
  { month: "Apr", value: 11.3 },
  { month: "May", value: 11.5 },
  { month: "Jun", value: 11.7 },
  { month: "Jul", value: 11.9 },
  { month: "Aug", value: 12.1 },
  { month: "Sep", value: 12.3 },
];

const riskAccounts = [
  {
    score: 94,
    vendor: "Omega Systems Ltd",
    details: "245 DPD, 181+ days",
    amount: "$4789k",
  },
  {
    score: 87,
    vendor: "Pinnacle Healthcare",
    details: "178 DPD, 181+ days",
    amount: "$568k",
  },
  {
    score: 82,
    vendor: "Vertex Logistics Corp",
    details: "132 DPD, 91-180 days",
    amount: "$423k",
  },
  {
    score: 78,
    vendor: "Coastal Distribution",
    details: "95 DPD, 91-180 days",
    amount: "$446k",
  },
];

export default function ExecutiveDashboard() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* AR Portfolio Trend */}
      <div className="lg:col-span-2 rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 uppercase">
              AR Portfolio Trend
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Monthly receivables movement (last 12 months)
            </p>
          </div>

          <span className="rounded-md bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            LIVE
          </span>
        </div>

        <div className="h-[180px] mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient
                  id="colorGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#2563EB"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor="#2563EB"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                fontSize={12}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                fontSize={11}
              />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#2563EB"
                strokeWidth={3}
                fill="url(#colorGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Risk Accounts */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 uppercase">
            Top Risk Accounts
          </h2>

          <button className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800">
            View all
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="space-y-4">
          {riskAccounts.map((item) => (
            <div
              key={item.vendor}
              className="flex items-center justify-between border-b border-slate-100 pb-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {item.score}
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {item.vendor}
                  </p>

                  <p className="text-xs text-slate-500">
                    {item.details}
                  </p>
                </div>
              </div>

              <div className="text-sm font-bold text-red-500">
                {item.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}