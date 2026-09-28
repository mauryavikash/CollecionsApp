"use client";

import { useEffect, useState } from "react";

import { AuditHeader } from "@/components/audit/AuditHeader";
import { AuditKpiCards } from "@/components/audit/AuditKpiCard";
import { AuditTable } from "@/components/audit/AuditTable";
import { AuditChart } from "@/components/audit/AuditCharts";
import { AuditInsight } from "@/components/audit/AuditInsight";
import AuditActivityAnalytics from "@/components/audit/AuditActivityAnalytics";
import AuditEventDetails from "@/components/audit/AuditEventDetails";
import { LoadingState } from "@/components/common/LoadingState";
import { getAudit } from "@/app/lib/api";

export default function Audit() {
  const [auditData, setAuditData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getAudit().then((data) => {
      if (isMounted) {
        setAuditData(data?.data ?? data);
      }
    }).catch(() => {
      if (isMounted) {
        setAuditData({});
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!auditData) {
    return <LoadingState label="Loading audit data..." />;
  }

  return (
     <div>
      {/* HEADER */}
       <AuditHeader/>
      {/* KPI */}
      <AuditKpiCards data={auditData.auditKpis} />
      {/* CONTENT */}
      <AuditChart data={auditData.userDecisionAnalysis} />
      <div className="grid grid-cols-12 gap-3 mt-4 items-stretch">

        {/* TABLE */}
        <AuditTable data={auditData.auditTrail} />
        {/* RIGHT PANEL */}
        <div className="col-span-12 lg:col-span-3 flex">
          <AuditInsight data={auditData.auditInsights} />
        </div>

      </div>

      <AuditActivityAnalytics data={auditData.auditOverview} />
      <AuditEventDetails
        data={auditData.auditCaseDetails}
        riskDistribution={auditData.auditOverview?.riskDistribution}
      />
    
    </div>
  );
}