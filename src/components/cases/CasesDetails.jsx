import React, { useState } from "react";
import {
  Sparkles,
  MoreHorizontal,
  X,
  Plus,
    ArrowRight,
    UserPlus,
    FileSearch,
    AlertTriangle,
    BanknoteArrowUp,
} from "lucide-react";
import { toast } from "sonner";
import { submitCaseAction } from "@/app/lib/api";
export const CasesDetails = ({ caseData }) => {
    
    const selectedCase = caseData ?? {};
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    
    const handleAction = async (action) => {
    try {
        if (action === "approve" && !reason) {
        alert("Please select a reason code.");
        return;
        }

        setLoading(true);

        const payload = {
        pair_id: selectedCase?.pair_id,
        action,
        reason_code: reason ,
        comments: "",
        performed_by: "",
        actionedAt: new Date().toISOString(),
        };

        const response = await submitCaseAction(payload);

        toast.success("Action completed successfully");
    } catch (error) {
        // console.error(error);
        toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
        setLoading(false);
    }
    };
 
    const amount = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
    }).format(Number(selectedCase.amount ?? 0));
    const detectedOn = selectedCase.detectedOn
        ? new Date(selectedCase.detectedOn).toLocaleString()
        : "-";
  return (
   <div className="w-full bg-white rounded-[16px] border border-[#D1D5DB] shadow-[0px_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
    {/* Header */}
    <div className="px-4 pt-4">
        <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
            <h2 className="text-[18px] leading-[24px] font-semibold text-[#0F172A]">
            {selectedCase.case_id}
            </h2>

            <span className="px-2 py-[2px] text-[10px] font-medium rounded bg-[#F3E8FF] text-[#9333EA]">
            {selectedCase.case_type}
            </span>
        </div>

        <button className="text-[#64748B] hover:text-[#334155]">
            <X size={16} />
        </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-5 mt-4 border-b border-[#E5E7EB]">
        <button className="pb-2 text-[12px] font-medium text-[#2563EB] border-b border-[#2563EB]">
            Details
        </button>

        {/* <button className="pb-2 text-[12px] text-[#475569]">
            Transactions (4)
        </button>

        <button className="pb-2 text-[12px] text-[#475569]">
            AI Insights
        </button>

        <button className="pb-2 text-[12px] text-[#475569]">
            Audit Trail
        </button> */}
        </div>
    </div>

    {/* Details */}
    <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-y-5 gap-x-8">
        <Info
            label="STATUS"
            value={
            <span className="inline-flex px-2 py-[2px] rounded text-[10px] font-medium bg-[#DBEAFE] text-[#2563EB]">
                {selectedCase.risk_level ?? "-"}
            </span>
            }
        />

        <Info
            label="PRIORITY"
            value={
            <div className="flex items-center gap-1.5">
                <span className="w-[6px] h-[6px] rounded-full bg-[#EF4444]" />
                <span>{selectedCase.priority ?? "-"}</span>
            </div>
            }
        />

        <Info
            label="AMOUNT (USD)"
            value={
            <span className="font-semibold text-[14px]">
                {selectedCase?.invoice_1?.amount}
            </span>
            }
        />

        <Info
            label="VENDOR"
            value={selectedCase.vendor || "-"}
        />

        <Info
            label="DETECTED ON"
            value={detectedOn}
        />

        <Info
            label="INVOICE DATE"
            value={
            <span className="text-[#F59E0B]">
                {selectedCase.invoice_1?.invoice_date ?? "-"}
            </span>
            }
        />

        <Info
            label="INVOICE ID"
            value={selectedCase.invoice_1?.invoice_id ?? "-"}
        />

        <Info
            label="INVOICE NUMBER"
            value={selectedCase.invoice_1?.invoice_number ?? "-"}
        />
        </div>

        {/* AI Recommendation */}
        {/* <div className="mt-5 rounded-[6px] border border-[#D8B4FE] bg-[#FCFAFF] p-3">
        <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-[#7C3AED]" />

            <span className="text-[12px] font-semibold text-[#4C1D95]">
            AI Recommended Action
            </span>
        </div>

        <p className="mt-3 text-[10px] leading-4 text-[#334155]">
            This is a high-confidence <span className="font-semibold">true duplicate.</span> Both invoices have identical
            key attributes and amount.
        </p>

        <p className="mt-3 text-[10px] leading-4 text-[#334155]">
            <span className="font-semibold">Recommended Action:</span><br />
            Confirm duplicate and initiate recovery. Validate with vendor before
            payment adjustment.
        </p>

        <button className="mt-3 inline-flex h-6 items-center gap-1 rounded-[4px] border border-[#C4B5FD] bg-white px-2 text-[10px] font-semibold text-[#6D28D9] hover:bg-[#F5F3FF]">
            View Full Recommendation
            <ArrowRight size={12} />
        </button>
        </div> */}

        {/* Progress */}
        <div className="mt-5">
        <div className="text-[11px] font-semibold tracking-wide text-[#64748B]">
            CASE PROGRESS
        </div>

        <div className="mt-4 flex items-center">
            <div className="flex flex-col items-center">
            <div className="w-3.5 h-3.5 rounded-full bg-[#10B981]" />
            <span className="mt-2 text-[10px] text-[#334155]">
                Detected
            </span>
            </div>

            <div className="w-14 h-[2px] bg-[#2563EB] mx-3" />

            <div className="flex flex-col items-center">
            <div className="w-3.5 h-3.5 rounded-full bg-[#2563EB]" />
            <span className="mt-2 text-[10px] text-[#2563EB] font-medium">
                Under Review
            </span>
            </div>

            <div className="w-14 h-[2px] bg-[#E2E8F0] mx-3" />

            <div className="flex flex-col items-center">
            <div className="w-3.5 h-3.5 rounded-full bg-[#F1F5F9] border border-[#CBD5E1]" />
            <span className="mt-2 text-[10px] text-[#64748B]">
                Resolution
            </span>
            </div>

            <div className="w-14 h-[2px] bg-[#E2E8F0] mx-3" />

            <div className="flex flex-col items-center">
            <div className="w-3.5 h-3.5 rounded-full bg-[#F1F5F9] border border-[#CBD5E1]" />
            <span className="mt-2 text-[10px] text-[#64748B]">
                Closed
            </span>
            </div>
        </div>
        </div>

        

        {/* Notes */}
        {/* <div className="mt-6 pb-4">
        <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold tracking-wide text-[#64748B]">
            NOTES
            </div>

            <Plus size={14} className="text-[#475569]" />
        </div>

        <div className="mt-3 flex gap-2">
            <div className="w-6 h-6 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-[9px] font-semibold">
            SJ
            </div>

            <div>
            <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold text-[#0F172A]">
                Sarah Johnson
                </span>

                <span className="text-[10px] text-[#94A3B8]">
                May 20, 2025 11:15 AM
                </span>
            </div>

            <p className="mt-1 text-[12px] leading-4 text-[#475569] max-w-[320px]">
                Case assigned for review. Initial analysis
                indicates possible duplicate from similar invoice.
            </p>
            </div>
        </div>

        <button className="mt-3 text-[12px] font-medium text-[#2563EB]">
            View all notes
        </button>
        </div> */}

        {/* Quick Actions */}
        <div className="mt-2 mb-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
          <h3 className="text-sm font-semibold text-slate-900">Quick Actions</h3>

          <div className="mt-2">
            <label className="text-xs font-medium text-slate-600">
            Reason Code (Required for Confirm)
            </label>

            <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm outline-none focus:border-blue-500"
            >
            <option value="">Select a reason...</option>
            <option value="EXACT_MATCH">Exact Match</option>
            <option value="DUPLICATE_INVOICE">Duplicate Invoice</option>
            <option value="PAYMENT_ERROR">Payment Error</option>
            <option value="VENDOR_ISSUE">Vendor Issue</option>
            </select>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-3">
            {/* Confirm */}
            <button
            disabled={loading}
            onClick={() => handleAction("approve")}
            className="flex flex-col items-center justify-center rounded-lg bg-emerald-600 py-2 text-white hover:bg-emerald-700"
            >
            <FileSearch size={18} />
            <span className="mt-1 text-xs font-medium">
                Approved
            </span>
            </button>

            {/* Reject */}
            <button
            disabled={loading}
            onClick={() => handleAction("reject")}
            className="flex flex-col items-center justify-center rounded-lg bg-rose-600 py-2 text-white hover:bg-rose-700"
            >
            <X size={18} />
            <span className="mt-1 text-xs font-medium">
                Reject
            </span>
            </button>

            {/* Escalate */}
            <button
            disabled={loading}
            onClick={() => handleAction("escalate")}
            className="flex flex-col items-center justify-center rounded-lg border border-amber-500 bg-white py-2 text-amber-600 hover:bg-amber-50"
            >
            <AlertTriangle size={18} />
            <span className="mt-1 text-xs font-medium">
                Escalate
            </span>
            </button>
        </div>

        <p className="mt-2 text-xs text-slate-500">
            Confirm requires a reason code. Reject and Escalate do not.
        </p>

        <div className="mt-2 border-t pt-2">
            <div className="grid grid-cols-2 gap-y-2 text-sm">
            <span className="text-slate-500">Category</span>
            <span className="font-medium text-right">Exact Match</span>

            <span className="text-slate-500">Rule</span>
            <span className="font-medium text-right">Rule_1</span>

            <span className="text-slate-500">Similarity</span>
            <span className="font-medium text-right">{selectedCase?.similarity ?? "-"}</span>

            <span className="text-slate-500">Total Amount</span>
            <span className="font-medium text-right">{selectedCase?.invoice_1?.amount ?? "-"}</span>

            <span className="text-slate-500">Records</span>
            <span className="font-medium text-right">{selectedCase?.invoice_1?.invoice_count ?? "-"}</span>
            </div>

            <div className="mt-2 rounded-lg bg-slate-100 p-3">
                <div className="text-xs font-semibold text-slate-600">
                    Rule Explanation
                </div>

                <p className="mt-1 text-sm text-slate-700">
                    Exact match on all fields.
                </p>
            </div>
        </div>
        </div>
    </div>
    </div>
  );
};

function Info({ label, value }) {
  return (
    <div>
      <div className="text-[11px] font-semibold text-slate-500 tracking-wide mb-1">
        {label}
      </div>

      <div className="text-sm text-slate-800 font-medium">
        {value}
      </div>
    </div>
  );
}