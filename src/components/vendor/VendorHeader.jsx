import React from "react";
import {
  Upload,
  CheckCheck,
  Bell,
} from "lucide-react";
import PdfDownloadButton from "@/components/common/PdfDownloadButton";

export const VendorHeader = () => {
  return (
            <div className="contentHeader bg-white border border-[#D9E1EA] rounded-2xl shadow-[0px_2px_8px_rgba(15,23,42,0.05)] px-4 py-4 mb-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-[20px] font-semibold text-[#0F172A]">
                       Monitor and Act
                    </h1>
                    <p className="mt-1 text-[13px] text-[#64748B]">
                      Monitor and act on important events, anomalies, and system notifications.
                    </p>
                </div>

                {/* <div className="flex gap-2.5">
                    <PdfDownloadButton fileName="vendor" />
                    
                </div> */}
                </div>
            </div>
  );
};
