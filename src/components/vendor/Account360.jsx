"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import Account360Detail from "./Account360Detail";
import Overview from "./Overview";
import Transactions from "./Transactions";
import PTPhistory from "./PTPhistory";

export const account360Data = {
  account: { initials: "OS", name: "Omega Systems Ltd", id: "ACC-7234", terms: "Net 30", risk: "High Risk - Score 94", ptp: "PTP: Broken", phone: "+1 (415) 887-2341", email: "r.haines@omegasystems.com", contact: "Robert Haines", metrics: [{ label: "Overdue Amount", value: "$789K", tone: "text-[#c82626]" }, { label: "Total AR", value: "$1.24M" }, { label: "Days Past Due", value: "245", tone: "text-[#c82626]" }, { label: "Aging Bucket", value: "181+ days" }, { label: "Broken PTPs", value: "3", tone: "text-[#c82626]" }, { label: "Fulfilled PTPs", value: "1", tone: "text-[#148741]" }] },
  information: [{ label: "Payment Terms", value: "Net 30" }, { label: "Last Contact", value: "2026-09-10" }, { label: "Assigned Collector", value: "Sarah Chen" }],
  aging: [{ label: "0-30d", percent: 15, color: "#13a852" }, { label: "31-60d", percent: 25, color: "#63aa00" }, { label: "61-90d", percent: 30, color: "#e48100" }, { label: "91-180d", percent: 20, color: "#eb5600" }, { label: "181+d", percent: 10, color: "#dd2020" }],
  transactions: [{ invoice: "INV-2024-7823", date: "2026-07-01", due: "2026-07-31", amount: "$145K", status: "Overdue", days: "79d" }, { invoice: "INV-2024-6541", date: "2026-06-15", due: "2026-07-15", amount: "$89K", status: "Overdue", days: "95d" }, { invoice: "INV-2024-5234", date: "2026-05-28", due: "2026-06-27", amount: "$50K", status: "Paid", days: "–" }, { invoice: "INV-2024-4892", date: "2026-05-01", due: "2026-05-31", amount: "$234K", status: "Overdue", days: "140d" }, { invoice: "INV-2024-3219", date: "2026-04-10", due: "2026-05-10", amount: "$271K", status: "Overdue", days: "161d" }],
  ptpHistory: [{ invoice: "INV-2024-3219", status: "Broken", amount: "$400K", created: "2026-07-15", promise: "2026-08-30", note: "Third broken promise. Legal review initiated." }],
};

export default function Account360({ data = account360Data }) {
  const [tab, setTab] = useState("Overview");
  return <main className="min-h-full bg-[linear-gradient(115deg,#effeff_0%,#d7f7f8_47%,#abbcef_100%)] p-3 text-slate-700"><div className="mx-auto max-w-[1600px]"><nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-[11px] text-slate-500"><ChevronLeft className="h-4 w-4" /><span>Collector Workbench</span><span>›</span><span>Omega Systems Ltd</span><span>›</span><b className="text-slate-700">Account 360</b></nav><Account360Detail account={data.account} /><div role="tablist" className="mt-6 flex gap-2">{["Overview", "Transactions", "PTP History"].map((name) => <button key={name} type="button" role="tab" aria-selected={tab === name} onClick={() => setTab(name)} className={`rounded-full px-4 py-2 text-[10px] font-medium ${tab === name ? "bg-[#225ce0] text-white" : "bg-white text-slate-500"}`}>{name}{name === "PTP History" && <span className="ml-2 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-600">1</span>}</button>)}</div>{tab === "Overview" && <Overview data={data} />}{tab === "Transactions" && <Transactions transactions={data.transactions} />}{tab === "PTP History" && <PTPhistory history={data.ptpHistory} />}</div></main>;
}
