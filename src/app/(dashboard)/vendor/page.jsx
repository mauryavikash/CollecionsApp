"use client";
import React, { useEffect, useState } from "react";
import { VendorTable } from '@/components/vendor/VendorTable';
import { VendorHeader } from '@/components/vendor/VendorHeader';
import { VendorInsight } from '@/components/vendor/VendorInsight';
import { VendorKpiCard }  from '@/components/vendor/VendorKpiCard';
import VendorRiskControls from '@/components/vendor/VendorRiskControls';
import VendorExposureAnalytics from '@/components/vendor/VendorExposureAnalytics';
import VendorFindingsActions from '@/components/vendor/VendorFindingsActions';
import { LoadingState } from "@/components/common/LoadingState";
import { getVendors } from "@/app/lib/api";

export default function Vendor() {
  const [vendorData, setVendorData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getVendors().then((data) => {
      if (isMounted) {
        setVendorData(data?.data ?? data);
      }
    }).catch(() => {
      if (isMounted) {
        setVendorData({});
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!vendorData) {
    return <LoadingState label="Loading vendor data..." />;
  }

  return (
    <div>
          {/* HEADER */}
           <VendorHeader/>
          {/* KPI */}
          <VendorKpiCard data={vendorData.vendorKpis} />
          {/* CONTENT */}

          <div className="grid grid-cols-12 gap-4 mt-4 items-stretch">
    
            {/* TABLE */}
            <VendorTable data={vendorData.alerts} totalAlerts={vendorData.alertSummary?.totalAlerts} />
            {/* RIGHT PANEL */}
            <div className="col-span-12 lg:col-span-4 flex">
              <VendorInsight data={vendorData.alertSummary} />
            </div>
    
          </div>

          <VendorRiskControls data={vendorData.riskDrivers} />
          <VendorExposureAnalytics data={vendorData.vendorOverview} />
          <VendorFindingsActions
            issues={vendorData.vendorIssues}
            findings={vendorData.vendorFindings}
            actions={vendorData.recommendedActions}
          />
        </div>
  );
}