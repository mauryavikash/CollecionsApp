"use client";
import { useEffect, useState } from "react";
import { CalendarDays, SlidersHorizontal } from "lucide-react";
import { ChevronDown } from "lucide-react";
import DashboardKpiCards from "@/components/home/DashboardKpiCards";
import ManagementDashboard from "@/components/home/ManagementDashboard";
import OperationalReporting from "@/components/home/OperationalReporting";
import AiExecutiveBriefing from "@/components/home/AiExecutiveBriefing";
import { LoadingState } from "@/components/common/LoadingState";
import PdfDownloadButton from "@/components/common/PdfDownloadButton";
import { getHomeDashboard } from "@/app/lib/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function DashboardPage() {
  const [homeData, setHomeData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      try {
        const data = await getHomeDashboard();
        const payload = data?.data ?? data;
        if (isMounted && payload && typeof payload === "object") {
          setHomeData(payload);
        }
      } catch {
        // Keep static presentation available when the dashboard API is unavailable.
      }
    }

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!homeData) {
    return <LoadingState label="Loading dashboard data..." />;
  }

  const headerData = homeData.header ?? {};
  const userName = headerData.userName ?? homeData.userName ?? "Vigneshwaran";
  const dateRange = headerData.dateRange ?? homeData.dateRange ?? "May 14 – May 20, 2025";


  return (
    <div className="min-h-screen text-slate-800">
      <div className="mx-auto max-w-[1800px] space-y-3">
      
        {/* HEADER */}
 
      
        {/* KPI CARDS */}
        <DashboardKpiCards data={homeData.kpiCards} />

        <AiExecutiveBriefing data={homeData.aiExecutiveBriefing} />

        {/* MANAGEMENT DASHBOARD */}
        <ManagementDashboard data={homeData.managementDashboard} />
                    
        {/* OPERATIONAL REPORTING & AUDIT ACTIVITIES */}
        <OperationalReporting data={homeData.operationalReports} />

      </div>
    </div>
  );
}
