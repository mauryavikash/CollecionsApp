"use client";

import {
  AlertTriangle,
  DollarSign,
  Calendar,
  TrendingUp,
} from "lucide-react";

export default function DashboardKpiCards() {
  const cardClass =
    "relative h-[110px] rounded-2xl border-2 border-[#2563EB] bg-white px-4 py-3 overflow-hidden shadow-sm";

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
      {/* Total AR Portfolio */}
      <div className={cardClass}>
        <div className="flex items-start justify-between">
          <p className="text-[12px] font-semibold text-slate-600">
            Total AR Portfolio
          </p>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
            <DollarSign size={18} className="text-green-600" />
          </div>
        </div>

        <h2 className="mt-3 text-[20px] font-bold text-slate-800">
          $24.7M
        </h2>

        <p className="mt-1 text-[11px] font-medium text-green-600">
          ↑ +3.2%
          <span className="ml-1 text-slate-400">vs last month</span>
        </p>

        <div className="absolute bottom-4 right-4 flex items-end gap-1">
          {[5, 18, 10, 35, 26].map((v, i) => (
            <div
              key={i}
              className="w-[8px] rounded-full bg-green-500"
              style={{ height: `${v}px` }}
            />
          ))}
        </div>
      </div>

      {/* Overdue Amount */}
      <div className={cardClass}>
        <div className="flex items-start justify-between">
          <p className="text-[12px] font-semibold text-slate-600">
            Overdue Amount
          </p>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
        </div>

        <h2 className="mt-3 text-[20px] font-bold text-red-500">
          $8.3M
        </h2>

        <p className="mt-1 text-[11px] text-red-500">
          33.6%
          <span className="ml-1 text-slate-400">of total AR</span>
        </p>

        <div className="absolute bottom-4 right-4 flex items-end gap-1">
          {[10, 15, 22, 30, 40].map((h, i) => (
            <div
              key={i}
              className="w-[10px] rounded bg-orange-500"
              style={{ height: `${h}px` }}
            />
          ))}
        </div>
      </div>

      {/* High Risk Accounts */}
      <div className={cardClass}>
        <div className="flex items-start justify-between">
          <p className="text-[12px] font-semibold text-slate-600">
            High Risk Accounts
          </p>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100">
            <AlertTriangle size={18} className="text-amber-500" />
          </div>
        </div>

        <h2 className="mt-2 text-[20px] font-bold text-orange-500">
          5
        </h2>

        <div className="mt-2 flex gap-2 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            5
          </span>

          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            5
          </span>

          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-yellow-500" />
            4
          </span>

          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            3
          </span>
        </div>

        <p className="mt-2 text-[11px] text-red-500">$2.5M exposure</p>
      </div>

      {/* Promise to Pay */}
      <div className={cardClass}>
        <div className="flex items-start justify-between">
          <p className="text-[12px] font-semibold text-slate-600">
            Promise to Pay (PTP)
          </p>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
            <Calendar size={18} className="text-green-500" />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className="text-[20px] font-bold text-green-600">5</span>

          <span className="text-[12px] text-green-600">
            2 Active
          </span>

          <span className="text-[12px] text-orange-500">
            2 Broken
          </span>
        </div>

        <div className="absolute bottom-4 right-4 flex items-end gap-1">
          {[8, 18, 28, 8, 8, 22].map((v, i) => (
            <div
              key={i}
              className="w-[10px] rounded bg-blue-500"
              style={{ height: `${v}px` }}
            />
          ))}
        </div>
      </div>

      {/* Projected Cash Recovery */}
      <div className={cardClass}>
        <div className="flex items-start justify-between">
          <p className="text-[12px] font-semibold text-slate-600">
            Projected Cash Recovery
          </p>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
            <TrendingUp size={18} className="text-blue-500" />
          </div>
        </div>

        <div className="mt-2">
          <div className="text-[16px] font-bold text-green-600">
            $1.82M
            <span className="ml-1 text-[11px] text-slate-500">
              / 7 Days
            </span>
          </div>

          <div className="text-[16px] font-bold text-blue-600">
            $6.46M
            <span className="ml-1 text-[11px] text-slate-500">
              / 30 Days
            </span>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 flex items-end gap-1">
          {[6, 6, 12, 4, 16, 20].map((h, i) => (
            <div
              key={i}
              className={`w-[10px] rounded ${
                i < 3 ? "bg-green-500" : "bg-blue-200"
              }`}
              style={{ height: `${h}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}