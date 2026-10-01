"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import WorkbenchKpis from "./WorkbenchKpis";
import WorkbenchTable from "./WorkbenchTable";

export const collectorWorkbenchData = {
  title: "Collector Workbench",
  subtitle: "Daily action queue · 12 accounts assigned",
  summary: [
    { label: "Total Overdue", value: "$3.69M", color: "text-[#f34c54]" },
    { label: "High Risk", value: "5", color: "text-[#fa6e18]" },
    { label: "Active PTPs", value: "4", color: "text-[#2b65dc]" },
    { label: "Avg DPD", value: "87", color: "text-slate-800" },
  ],
  accounts: [
    { id: "ACC-7234", rank: 1, customer: "Omega Systems Ltd", overdue: "$789.2K", share: "64% of AR", dpd: 245, bucket: "181+ days", risk: "High", ptp: "Broken", date: "2026-08-30", owner: "Sarah Chen", initials: "SC", avatar: "bg-[#2865dc]", note: "CEO unreachable for 3 weeks. Legal escalation initiated. Last promise broken Aug 30. CFO meeting scheduled Sep 25.", lastContact: "2026-09-10" },
    { id: "ACC-5891", rank: 2, customer: "Pinnacle Healthcare", overdue: "$567.8K", share: "58% of AR", dpd: 178, bucket: "181+ days", risk: "High", ptp: "Active", date: "2026-09-30", owner: "Emma Rodriguez", initials: "ER", avatar: "bg-[#234cad]" },
    { id: "ACC-3345", rank: 3, customer: "Global Logistics Corp", overdue: "$423.0K", share: "62% of AR", dpd: 132, bucket: "91-180 days", risk: "Medium", ptp: "Broken", date: "2026-09-10", owner: "Sarah Chen", initials: "SC", avatar: "bg-[#2865dc]" },
    { id: "ACC-6723", rank: 4, customer: "Coastal Distribution", overdue: "$445.6K", share: "62% of AR", dpd: 95, bucket: "91-180 days", risk: "Low", ptp: "Due Soon", date: "2026-09-25", owner: "Emma Rodriguez", initials: "ER", avatar: "bg-[#234cad]" },
    { id: "ACC-1102", rank: 5, customer: "Acme Manufacturing Ltd", overdue: "$284.5K", share: "53% of AR", dpd: 87, bucket: "61-90 days", risk: "Low", ptp: "Active", date: "2026-10-15", owner: "Sarah Chen", initials: "SC", avatar: "bg-[#2865dc]" },
  ],
};

export default function CollectorWorkbench({ data = collectorWorkbenchData }) {
  const [refreshing, setRefreshing] = useState(false);
  const refresh = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <main className="min-h-full text-slate-700">
      <div className="mx-auto max-w-[1600px]">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-[18px] font-bold leading-5 text-slate-800">{data.title}</h1>
            <p className="mt-0.5 text-[10px] text-slate-500">{data.subtitle}</p>
          </div>
          <button type="button" onClick={refresh} className="inline-flex h-[27px] items-center gap-1 rounded-md bg-white px-2 text-[9px] text-slate-600 shadow-sm">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing" : "Refresh"}
          </button>
        </header>
        <WorkbenchKpis summary={data.summary} />
        <WorkbenchTable accounts={data.accounts} />
      </div>
    </main>
  );
}
