"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import CollectionKpiCard from "@/components/collectionsDashboard/CollectionKpiCard";
import CollectionCashRecovery from "@/components/collectionsDashboard/CollectionCashRecovery";
import CollectionChart from "@/components/collectionsDashboard/CollectionChart";
import CollectorPerformance from "@/components/collectionsDashboard/CollectorPerformance";
import { LoadingState } from "@/components/common/LoadingState";
import WelcomeBanner from "@/components/common/WelcomeBanner";
import { getDashboard } from "@/app/lib/api";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* Backend "as of" date formatted as "17 Sep 2026" (date only, no time).
   Prefers ISO fields (asOfDate / updatedAt) and parses them in UTC so the
   day never shifts with the browser timezone. Falls back to stripping the
   time portion from the display string ("17 Sep 2026, 12:00 AM"). */
function resolveAsOfDate(data) {
  const iso = data?.asOfDate ?? data?.updatedAt;
  if (iso) {
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) {
      const day = String(d.getUTCDate()).padStart(2, "0");
      return `${day} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    }
  }
  const text = data?.asOf ?? data?.lastUpdated ?? data?.kpis?.[0]?.asOf;
  if (!text) return null;
  return String(text).replace(/^As of\s*/i, "").split(",")[0].trim() || null;
}

function resolveForecast(data) {
  if (Array.isArray(data?.forecast)) {
    return data.forecast;
  }

  if (Array.isArray(data?.forecast?.items)) {
    return data.forecast.items;
  }

  if (Array.isArray(data?.forecast?.data)) {
    return data.forecast.data;
  }

  return [];
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadHomeData = useCallback(
    ({ force = false } = {}) =>
      getDashboard({}, { force })
        .then((response) => {
          const payload = response?.data ?? response;
          const hasPayload =
            payload &&
            typeof payload === "object" &&
            Object.keys(payload).length > 0;

          setError(null);
          setDashboardData(hasPayload ? payload : null);
        })
        .catch((err) => {
          console.error("Dashboard API Error:", err);
          setError(err);
          setDashboardData(null);
        })
        .finally(() => {
          setLoading(false);
          setRefreshing(false);
        }),
    [],
  );

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const resolvedDashboardData =
    dashboardData?.collectionsDashboard ??
    dashboardData ??
    {};

  const forecast = resolveForecast(resolvedDashboardData);
  const asOfDate = resolveAsOfDate(resolvedDashboardData);

  if (loading) {
    return <LoadingState label="Loading dashboard data..." />;
  }

  if (error && !dashboardData) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-center">
        <div className="rounded-full bg-red-50 p-3">
          <RefreshCw className="h-6 w-6 text-red-400" />
        </div>
        <h2 className="text-[15px] font-bold text-slate-700">Unable to load dashboard</h2>
        <p className="max-w-md text-[12px] text-slate-500">
          The backend returned an error (status {error?.response?.status || 500}). This is usually a temporary server issue.
        </p>
        <button
          type="button"
          onClick={() => loadHomeData({ force: true })}
          className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </button>
      </div>
    );
  }

  return (
    <main
      className="min-h-full text-slate-800"
      aria-busy={loading}
      data-has-error={Boolean(error)}
    >
      <div className="mx-auto max-w-[1680px] space-y-4 pr-2 sm:pr-4">
        <WelcomeBanner
          description={resolvedDashboardData?.subtitle ?? "Overview of AR, Risk, PTP and recovery performance"}
          dateLabel={asOfDate ? `As of ${asOfDate}` : null}
          actions={
            <button
              type="button"
              onClick={() => {
                setRefreshing(true);
                loadHomeData({ force: true });
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing" : "Refresh"}
            </button>
          }
        />

        <CollectionKpiCard
          kpis={resolvedDashboardData?.kpis ?? []}
          asOfDate={asOfDate}
          asOfIso={resolvedDashboardData?.asOfDate}
          forecast={forecast}
        />

        <CollectionCashRecovery
          forecast={forecast}
          asOfIso={resolvedDashboardData?.asOfDate}
          riskAccounts={resolvedDashboardData?.riskAccounts ?? []}
        />

        <CollectionChart
          riskDistribution={
            resolvedDashboardData?.riskDistribution ?? []
          }
          ptpActivity={resolvedDashboardData?.ptpActivity ?? []}
          ptpActivityMeta={resolvedDashboardData?.ptpActivityMeta}
        />

        <CollectorPerformance
          collectors={resolvedDashboardData?.collectors}
          meta={resolvedDashboardData?.collectorsMeta}
          availableYears={resolvedDashboardData?.filters?.availableYears}
        />
      </div>
    </main>
  );
}