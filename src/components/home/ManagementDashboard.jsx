"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const forecastData = [
  { name: "Wk 1", actual: 1000, projected: 1200 },
  { name: "Wk 2", actual: 1100, projected: 1150 },
  { name: "Wk 3", actual: 1200, projected: 1350 },
  { name: "Wk 4", actual: 0, projected: 1400 },
  { name: "M2 W1", actual: 0, projected: 1100 },
  { name: "M2 W2", actual: 0, projected: 1450 },
];

const collectorPerformance = [
  {
    name: "Sarah Chen",
    percentage: 84,
    achieved: "$2.3M",
    target: "$2.5M",
    color: "#D97706",
  },
  {
    name: "Monica Rodriguez",
    percentage: 85,
    achieved: "$1.9M",
    target: "$2.2M",
    color: "#D97706",
  },
  {
    name: "James Wilson",
    percentage: 90,
    achieved: "$1.6M",
    target: "$1.8M",
    color: "#16A34A",
  },
  {
    name: "Mark Davis",
    percentage: 97,
    achieved: "$1.4M",
    target: "$2.0M",
    color: "#16A34A",
  },
];

export default function RecoveryAndCollectorDashboard() {
  return (
    <div className="grid grid-cols-12 gap-4">
  {/* CASH RECOVERY FORECAST */}
  <div className="col-span-12 lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <h2 className="text-lg font-bold text-slate-800 uppercase">
          CASH RECOVERY FORECAST
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Projected vs Actual • Next 30 Days
        </p>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-[#2563EB]" />
          Actual
        </div>

        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-[#BFD8FF]" />
          Projected
        </div>
      </div>
    </div>

    <div className="mt-5 h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={forecastData}>
          <CartesianGrid
            vertical={false}
            stroke="#E5E7EB"
          />

          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
          />

          <Tooltip />

          <Bar
            dataKey="projected"
            fill="#BFD8FF"
            radius={[4, 4, 0, 0]}
            barSize={24}
          />

          <Bar
            dataKey="actual"
            fill="#2563EB"
            radius={[4, 4, 0, 0]}
            barSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>

  {/* COLLECTOR PERFORMANCE */}
  <div className="col-span-12 lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-bold text-slate-800 uppercase">
        COLLECTOR PERFORMANCE (SEP 2026)
      </h2>

      <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
        View all →
      </button>
    </div>

    <div className="space-y-6">
      {collectorPerformance.map((item) => (
        <div key={item.name}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-700">
              {item.name}
            </span>

            <span
              className="font-semibold"
              style={{ color: item.color }}
            >
              {item.percentage}%

              <span className="ml-1 text-xs text-slate-500">
                ({item.achieved}/{item.target})
              </span>
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
  );
}