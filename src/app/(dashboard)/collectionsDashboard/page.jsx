"use client";

import { useEffect, useState } from "react";
import CollectionKpiCard from "@/components/collectionsDashboard/CollectionKpiCard";
import CollectionCashRecovery from "@/components/collectionsDashboard/CollectionCashRecovery";
import CollectionChart from "@/components/collectionsDashboard/CollectionChart";
import CollectionTable from "@/components/collectionsDashboard/CollectionTable";
import { LoadingState } from "@/components/common/LoadingState";
import { getDashboard } from "@/app/lib/api";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      try {
        setLoading(true);
        setError(null);

        const response = await getDashboard();
        const payload = response?.data ?? response;

        const hasPayload =
          payload &&
          typeof payload === "object" &&
          Object.keys(payload).length > 0;

        if (isMounted) {
          setDashboardData(hasPayload ? payload : null);
        }
      } catch (err) {
        console.error("Dashboard API Error:", err);

        if (isMounted) {
          setError(err);
          setDashboardData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const resolvedDashboardData =
    dashboardData?.collectionsDashboard ??
    dashboardData ??
    {};

  if (loading) {
    return <LoadingState label="Loading dashboard data..." />;
  }

  return (
    <main
      className="min-h-full text-slate-800"
      aria-busy={loading}
      data-has-error={Boolean(error)}
    >
      <div className="mx-auto max-w-[1480px] space-y-4">
        <CollectionKpiCard
          kpis={resolvedDashboardData?.kpis ?? []}
        />

        <CollectionCashRecovery
          forecast={resolvedDashboardData?.forecast ?? {}}
          riskAccounts={resolvedDashboardData?.riskAccounts ?? []}
        />

        <CollectionChart
          riskDistribution={
            resolvedDashboardData?.riskDistribution ?? []
          }
          collectors={resolvedDashboardData?.collectors ?? []}
        />

        <CollectionTable
          activity={resolvedDashboardData?.ptpActivity ?? []}
        />
      </div>
    </main>
  );
}