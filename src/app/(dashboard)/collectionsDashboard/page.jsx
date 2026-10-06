"use client";

import { useEffect, useState } from "react";
import CollectionKpiCard from "@/components/collectionsDashboard/CollectionKpiCard";
import CollectionCashRecovery from "@/components/collectionsDashboard/CollectionCashRecovery";
import CollectionChart from "@/components/collectionsDashboard/CollectionChart";
import CollectionTable from "@/components/collectionsDashboard/CollectionTable";
import { LoadingState } from "@/components/common/LoadingState";
import { getDashboard } from "@/app/lib/api";

const KPI_STYLE_FALLBACK = [
  {
    type: "sparkline",
    trend: "+0%",
    context: "vs last month",
    values: [8, 12, 9, 18, 14, 24, 20],
  },
  {
    type: "aging",
    trend: "0%",
    context: "of total AR",
    values: [7, 11, 15, 9, 13],
  },
  {
    type: "risk",
    context: "exposure",
    values: [
      { color: "#f15a63", value: 0 },
      { color: "#fb9337", value: 0 },
      { color: "#4bc173", value: 0 },
    ],
  },
  {
    type: "ptp",
    active: 0,
    broken: 0,
    context: "(last 7 days)",
    values: [4, 6, 7, 9, 6, 8, 7],
  },
  {
    type: "recovery",
    secondaryValue: "$0",
    values: [3, 3, 4, 4, 5, 6],
  },
];

function normalizeKpis(kpis = []) {
  return KPI_STYLE_FALLBACK.map((styleItem, index) => {
    const apiItem = kpis?.[index] ?? {};
    return {
      ...styleItem,
      ...apiItem,
      type: styleItem.type,
      values: apiItem?.values ?? styleItem.values,
      active: apiItem?.active ?? styleItem.active,
      broken: apiItem?.broken ?? styleItem.broken,
      secondaryValue: apiItem?.secondaryValue ?? styleItem.secondaryValue,
    };
  });
}

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
        const hasPayload = Boolean(
          payload &&
          typeof payload === "object" &&
          Object.keys(payload)?.length
        );

        if (isMounted && hasPayload) {
          setDashboardData(payload);
        } else if (isMounted) {
          setDashboardData(null);
        }
      } catch (error) {
        console.error("Dashboard API Error:", error);
        if (isMounted) {
          setError(error);
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
  const normalizedKpis = normalizeKpis(resolvedDashboardData?.kpis ?? []);

  if (loading) {
    return <LoadingState label="Loading dashboard data..." />;
  }

  return (
    <main className="min-h-full text-slate-800" aria-busy={loading} data-has-error={Boolean(error)}>
      <div className="mx-auto max-w-[1480px] space-y-4">
        <CollectionKpiCard
          kpis={normalizedKpis}
        />

        <CollectionCashRecovery
          forecast={resolvedDashboardData?.forecast}
          riskAccounts={resolvedDashboardData?.riskAccounts ?? []}
        />

        <CollectionChart
          riskDistribution={resolvedDashboardData?.riskDistribution ?? []}
          collectors={resolvedDashboardData?.collectors ?? []}
        />

        <CollectionTable
          activity={resolvedDashboardData?.ptpActivity ?? []}
        />
      </div>
    </main>
  );
}