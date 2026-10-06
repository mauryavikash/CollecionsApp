"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import WorkbenchKpis from "@/components/workbench/WorkbenchKpis";
import WorkbenchTable from "@/components/workbench/WorkbenchTable";
import { LoadingState } from "@/components/common/LoadingState";
import { getWorkbench } from "@/app/lib/api";

const WORKBENCH_TITLE = "Collector Workbench";
const WORKBENCH_SUBTITLE = "Daily action queue";

export default function CollectorWorkbenchPage() {
  const [workbenchApiData, setWorkbenchApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadWorkbenchData() {
      try {
        setError(null);

        const response = await getWorkbench();
        const payload = response?.data ?? response;
        const hasPayload = Boolean(
          payload &&
          typeof payload === "object" &&
          Object.keys(payload)?.length
        );

        if (isMounted) {
          setWorkbenchApiData(hasPayload ? payload : null);
        }
      } catch (error) {
        console.error("Workbench API Error:", error);
        if (isMounted) {
          setError(error);
          setWorkbenchApiData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadWorkbenchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    setLoading(true);

    try {
      setError(null);

      const response = await getWorkbench();
      const payload = response?.data ?? response;
      const hasPayload = Boolean(
        payload &&
        typeof payload === "object" &&
        Object.keys(payload)?.length
      );

      setWorkbenchApiData(hasPayload ? payload : null);
    } catch (error) {
      console.error("Workbench API Error:", error);
      setError(error);
      setWorkbenchApiData(null);
    } finally {
      setLoading(false);
    }

    window.setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const resolvedWorkbenchData =
    workbenchApiData?.collectorWorkbench ??
    workbenchApiData ??
    {};
  const workbenchSummary =
    resolvedWorkbenchData?.summary ??
    resolvedWorkbenchData?.kpis ??
    [];
  const workbenchAccounts =
    resolvedWorkbenchData?.accounts ??
    resolvedWorkbenchData?.workbenchAccounts ??
    [];

  if (loading) {
    return <LoadingState label="Loading workbench data..." />;
  }

  return (
    <main className="min-h-full text-slate-700" aria-busy={loading} data-has-error={Boolean(error)}>
      <div className="mx-auto max-w-[1600px]">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-[18px] font-bold leading-5 text-slate-800">
              {resolvedWorkbenchData?.title ?? WORKBENCH_TITLE}
            </h1>

            <p className="mt-0.5 text-[10px] text-slate-500">
              {resolvedWorkbenchData?.subtitle ?? WORKBENCH_SUBTITLE}
            </p>
          </div>

          <button
            type="button"
            onClick={refresh}
            className="inline-flex h-[27px] items-center gap-1 rounded-md bg-white px-2 text-[9px] text-slate-600 shadow-sm"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                refreshing ? "animate-spin" : ""
              }`}
            />

            {refreshing ? "Refreshing" : "Refresh"}
          </button>
        </header>

        <WorkbenchKpis
          summary={workbenchSummary}
        />

        <WorkbenchTable
          accounts={workbenchAccounts}
        />
      </div>
    </main>
  );
}