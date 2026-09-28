import React from "react";
import {
  CalendarDays,
  SlidersHorizontal,
  Plus,
} from "lucide-react";
import PdfDownloadButton from "@/components/common/PdfDownloadButton";

export const RecoveriesHeader = () => {
  return (
            <div className="contentHeader bg-white border border-[#D9E1EA] rounded-2xl shadow-[0px_2px_8px_rgba(15,23,42,0.05)] px-4 py-4 mb-4">
                <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[20px] font-semibold text-[#0F172A]">
                    Track, Manage and Reconcile
                    </h1>
                    <p className="mt-1 text-[14px] text-[#64748B]">
                    financial recoveries and prevention of duplicate payments.
                    </p>
                </div>

                {/* <div className="flex gap-3">
                    <PdfDownloadButton fileName="recoveries" />
                </div> */}
                </div>
            </div>
  );
};
