"use client";
import React, { useState } from "react";
import { X, Check, CircleCheck, FilePenLine, Sparkles } from "lucide-react";

const statusBadgeClass = (status) => {
  switch (status) {
    case "Completed":
      return "bg-[#D1FAE5] text-[#10B981]";
    case "In Progress":
      return "bg-[#DBEAFE] text-[#2563EB]";
    case "Failed":
      return "bg-[#FEE2E2] text-[#EF4444]";
    default:
      return "bg-[#F1F5F9] text-[#64748B]";
  }
};

const formatDate = (value) => value ? new Date(value).toLocaleString() : "-";

export const RecoveriesDetails = ({ recovery, stages, timeline, tabs }) => {
  // const [activeTab, setActiveTab] = useState("Overview");
  const [isDraftGenerated, setIsDraftGenerated] = useState(false);

  const selected = recovery ?? {};
  const progressStages = Array.isArray(stages) ? stages : [];
  const timelineEvents = Array.isArray(timeline) ? timeline : [];
  // const detailTabs = Array.isArray(tabs) ? tabs.map((tab) => tab.tab) : [];

  const isClosed = selected.status === "Completed";

  return (
    <div className="w-full flex flex-col bg-white rounded-[16px] border border-[#D9E1EA] shadow-[0px_2px_8px_rgba(15,23,42,0.05)] overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] leading-[22px] font-semibold text-[#0F172A]">
              {selected.recoveryId}
            </h2>

            <span
              className={`px-2 py-[2px] text-[10px] font-semibold rounded ${statusBadgeClass(
                selected.status
              )}`}
            >
              {selected.status}
            </span>
          </div>

          <button className="text-[#64748B] hover:text-[#334155]" aria-label="Close recovery details">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mt-3 border-b border-[#E5E7EB] overflow-x-auto" role="tablist">
          {/* {detailTabs.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-[12px] font-medium whitespace-nowrap ${
                activeTab === tab
                  ? "text-[#2563EB] border-b-2 border-[#2563EB]"
                  : "text-[#475569]"
              }`}
            >
              {tab}
            </button>
          ))} */}

          <h5 className="pb-2 text-[12px] font-medium text-[#2563EB] border-b border-[#2563EB]">Overview</h5>
        </div>
      </div>

      {/* Overview */}
      <div className="px-4 pt-4 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2.5 text-[12px]">
          <MetaRow label="Recovery Type" value={selected.type} />
          <MetaRow
            label="Status"
            value={
              <span
                className={`px-2 py-[2px] rounded text-[10px] font-semibold ${statusBadgeClass(
                  selected.status
                )}`}
              >
                {selected.status}
              </span>
            }
          />
          <MetaRow label="Vendor" value={selected.vendor || "-"} bold />
          <MetaRow label="Amount (USD)" value={selected.amount} bold />
          <MetaRow label="Recovered On" value={formatDate(selected.recoveredOn)} />
          <MetaRow label="Payment Date" value={formatDate(selected.paymentDate)} />
          <MetaRow
            label="Original Payment ID"
            value={<span className="text-[#2563EB] font-medium">{selected.originalPaymentId}</span>}
          />
          <MetaRow label="Investigator" value={selected.investigator ?? "Unassigned"} />
          <MetaRow label="Source System" value={selected.sourceSystem} />
          <MetaRow label="Recovery Method" value={selected.recoveryMethod} />
          <MetaRow label="Notes" value={selected.notes} />
        </div>

        {/* Recovery Progress */}
        <div className="mt-5">
          <div className="text-[11px] font-semibold tracking-wide text-[#64748B]">
            RECOVERY PROGRESS
          </div>

          <div className="mt-4 flex items-center">
            {progressStages.map((stage, index) => (
              <React.Fragment key={stage.stage}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isClosed ? "bg-[#10B981]" : "bg-[#E2E8F0]"
                    }`}
                  >
                    {isClosed && <Check size={12} className="text-white" />}
                  </div>
                  <span className="mt-2 text-[10px] font-medium text-[#334155]">
                    {stage.stage}
                  </span>
                  <span className="text-[9px] text-[#94A3B8]">{formatDate(stage.date)}</span>
                </div>

                {index < progressStages.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] mx-1 -mt-4 ${
                      isClosed ? "bg-[#10B981]" : "bg-[#E2E8F0]"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <span className="sr-only">
            Recovery progress: {progressStages.map((stage) => `${stage.stage} (${stage.date})`).join(", ")}.
          </span>
        </div>

        {/* <div className="mt-5 rounded-md border border-[#DDD6FE] bg-[#FCFAFF] p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6D28D9]">
            <Sparkles size={14} />
            AI Next Best Action
          </div>
          <p className="mt-3 text-[10px] leading-4 text-[#475569]">
            The vendor has not responded for 6 days.
          </p>
          <p className="mt-3 text-[10px] leading-4 text-[#475569]">
            <span className="font-semibold text-[#334155]">Recommendation:</span> Send follow-up email and request expected credit memo date.
          </p>
          <div className="mt-3 text-[10px] font-semibold text-[#475569]">Suggested Action:</div>
          <div className="mt-2 space-y-1.5 text-[10px] text-[#475569]">
            <div className="flex items-center gap-1.5"><CircleCheck size={12} className="text-[#22C55E]" /> Send follow-up email (Template available)</div>
            <div className="flex items-center gap-1.5"><CircleCheck size={12} className="text-[#22C55E]" /> Escalate if no response in 3 days</div>
          </div>
          <button
            type="button"
            onClick={() => setIsDraftGenerated(true)}
            className="mt-3 inline-flex h-7 items-center gap-1.5 rounded border border-[#C4B5FD] bg-white px-2 text-[10px] font-semibold text-[#6D28D9] hover:bg-[#F5F3FF]"
          >
            <FilePenLine size={12} />
            {isDraftGenerated ? "Email Draft Generated" : "Generate Email Draft"}
          </button>
        </div> */}

        {/* Recovery Timeline */}
        <div className="mt-6 pb-4">
          <div className="text-[11px] font-semibold tracking-wide text-[#64748B] mb-3">
            RECOVERY TIMELINE
          </div>

          <ol className="flex flex-col gap-3.5">
            {timelineEvents.map((event, index) => (
              <li key={`${event.event}-${event.timestamp}`} className="flex gap-2.5">
                <div className="flex flex-col items-center">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] mt-1 shrink-0" />
                  {index < timelineEvents.length - 1 && (
                    <span className="w-px flex-1 bg-[#E2E8F0] mt-1" />
                  )}
                </div>

                <div className="flex-1 flex items-start justify-between gap-2 pb-1">
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-[#0F172A]">
                      {event.event}
                    </p>
                    <p className="text-[11px] text-[#64748B]">{event.actor}</p>
                  </div>
                  <span className="text-[10px] text-[#94A3B8] whitespace-nowrap shrink-0">
                    {formatDate(event.timestamp)}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Footer actions */}
      {/* <div className="border-t border-[#E2E8F0] p-3 flex items-center gap-2">
        <button className="flex-[2] h-9 rounded-lg bg-[#2563EB] text-white text-[12px] font-medium hover:bg-[#1D4ED8]">
          View Related Case
        </button>

        <button className="flex-[1.4] h-9 rounded-lg border border-[#CBD5E1] bg-white text-[12px] font-medium text-[#334155]">
          Download Receipt
        </button>

        <button
          className="h-9 w-9 shrink-0 rounded-lg border border-[#CBD5E1] bg-white flex items-center justify-center text-[#334155]"
          aria-haspopup="menu"
          aria-label="More recovery actions"
        >
          <ChevronDown size={14} />
        </button>
      </div> */}
    </div>
  );
};

function MetaRow({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[#64748B]">{label}</span>
      <span className={`text-right text-[#0F172A] ${bold ? "font-semibold" : ""}`}>
        {value}
      </span>
    </div>
  );
}
