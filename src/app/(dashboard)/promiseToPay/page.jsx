"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, RefreshCw, X } from "lucide-react";
import PtpKpiCards from "@/components/promiseToPay/PtpKpiCards";
import PtpCharts, { PeriodSelect } from "@/components/promiseToPay/PtpCharts";
import PromiseToPayCard from "@/components/promiseToPay/PromiseToPayCard";
import PromiseToPayTable from "@/components/promiseToPay/PromiseToPayTable";
import { LoadingState } from "@/components/common/LoadingState";
import { getPromiseToPay, getPtpAnalytics } from "@/app/lib/api";
import {
  PTP_TABS,
  buildPtpAnalytics,
  countByTab,
  mapBackendPtpAnalytics,
  matchesTab,
  normalizePtpRecords,
} from "@/components/promiseToPay/ptpAnalytics";

function monthLabel(value) {
  if (!value || value === "all") return "All months";
  const [year, month] = String(value).split("-").map(Number);
  if (!year || !month) return value;
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const PAGE_SIZES = [6, 12, 24, 48];

function FilterSelect({ value, onChange, allLabel, options, disabled }) {
  return (
    <label className="relative inline-flex">
      <span className="sr-only">{allLabel}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 min-w-[150px] appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-[12px] font-semibold text-blue-700 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <option value="All">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
    </label>
  );
}

function formatAsOn(date) {
  if (!date) return "";
  const day = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${day} | ${time}`;
}

export default function PromiseToPayPage() {
  const [payload, setPayload] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [collector, setCollector] = useState("All");
  const [region, setRegion] = useState("All");
  const [period, setPeriod] = useState(6);
  const [promiseDate, setPromiseDate] = useState("");
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);
  // "" = backend default (latest completed month); otherwise YYYY-MM or "all".
  const [month, setMonth] = useState("");
  const [analyticsPayload, setAnalyticsPayload] = useState(null);
  const [analyticsVersion, setAnalyticsVersion] = useState(0);

  const load = useCallback(
    ({ force = false } = {}) =>
      getPromiseToPay({ force, month: month || undefined })
        .then((response) => {
          setError(null);
          setPayload(response?.data ?? response ?? null);
          setFetchedAt(new Date());
        })
        .catch((err) => {
          console.error("Promise To Pay API Error:", err);
          setError(err);
        })
        .finally(() => {
          setLoading(false);
          setRefreshing(false);
        }),
    [month],
  );

  useEffect(() => {
    load();
  }, [load]);

  // KPI cards and charts come from GET /ui/ptp-analytics. If that endpoint is not
  // available (older backend deployment), the page falls back to client-side analytics.
  useEffect(() => {
    let cancelled = false;
    getPtpAnalytics({ months: period, collector: collector === "All" ? "all" : collector, month: month || undefined })
      .then((response) => {
        if (!cancelled) setAnalyticsPayload(response?.data ?? response ?? null);
      })
      .catch((err) => {
        console.warn("PTP analytics API unavailable, using client-side analytics:", err?.response?.status ?? err);
        if (!cancelled) setAnalyticsPayload(null);
      });
    return () => {
      cancelled = true;
    };
  }, [period, collector, month, analyticsVersion]);

  const allRecords = useMemo(() => {
    const source = payload?.promiseToPay ?? payload ?? {};
    return normalizePtpRecords(source.promiseToPayRecords ?? source.records ?? []);
  }, [payload]);

  const collectorOptions = useMemo(() => {
    const fromAnalytics = (analyticsPayload?.filters?.collectors ?? []).filter((name) => name && name !== "All Collectors");
    const fromRecords = allRecords.map((record) => record.owner).filter((name) => name && name !== "Unassigned");
    return [...new Set([...fromAnalytics, ...fromRecords])].sort();
  }, [allRecords, analyticsPayload]);
  const monthOptions = useMemo(() => {
    const source = payload?.promiseToPay ?? payload ?? {};
    return source.availableMonths ?? [];
  }, [payload]);
  const selectedMonth = month || (payload?.promiseToPay ?? payload)?.period?.month || "";
  const regionOptions = useMemo(
    () => [...new Set(allRecords.map((record) => record.region).filter(Boolean))].sort(),
    [allRecords],
  );

  const scopedRecords = useMemo(
    () =>
      allRecords.filter(
        (record) =>
          (collector === "All" || record.owner === collector) &&
          (region === "All" || record.region === region),
      ),
    [allRecords, collector, region],
  );

  const tabs = useMemo(() => countByTab(scopedRecords), [scopedRecords]);
  const analytics = useMemo(
    () =>
      analyticsPayload?.kpis && region === "All"
        ? mapBackendPtpAnalytics(analyticsPayload)
        : buildPtpAnalytics(scopedRecords, period),
    [analyticsPayload, region, scopedRecords, period],
  );
  const asOnLabel = analytics.asOfLabel ?? `As on ${formatAsOn(fetchedAt)}`;

  const visibleRecords = useMemo(
    () =>
      scopedRecords.filter(
        (record) => matchesTab(record, activeTab) && (!promiseDate || record.promiseDate === promiseDate),
      ),
    [scopedRecords, activeTab, promiseDate],
  );

  const totalPages = Math.max(1, Math.ceil(visibleRecords.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const updateFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  if (loading) {
    return <LoadingState label="Loading promise to pay data..." />;
  }

  if (error && !payload) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-center">
        <h2 className="text-[15px] font-bold text-slate-700">Unable to load promise-to-pay data</h2>
        <p className="text-[12px] text-slate-500">Status {error?.response?.status ?? "unknown"}. Please try again.</p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            load({ force: true });
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-semibold text-white hover:bg-blue-700"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-full text-slate-700" data-has-error={Boolean(error)}>
      <div className="mx-auto max-w-[1680px] min-w-0 space-y-3 pr-2 sm:pr-4">
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div role="tablist" aria-label="PTP status" className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const active = activeTab === tab.label;
              return (
                <button
                  key={tab.label}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => updateFilter(setActiveTab)(tab.label)}
                  className={`inline-flex h-8 items-center gap-2 rounded-lg border px-3.5 text-[12px] font-semibold transition-colors ${
                    active
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-blue-800 hover:border-blue-300"
                  }`}
                >
                  {tab.label}
                  <span className={active ? "rounded bg-white/20 px-1.5 text-[11px]" : "text-[11px] text-slate-700"}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setRefreshing(true);
                load({ force: true });
                setAnalyticsVersion((version) => version + 1);
              }}
              title="Refresh data"
              className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-semibold text-blue-800 hover:border-blue-300"
            >
              {refreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              ) : (
                <CalendarDays className="h-4 w-4 text-blue-600" />
              )}
              {asOnLabel}
            </button>
            {monthOptions.length > 0 && (
              <label className="relative inline-flex">
                <span className="sr-only">PTP month</span>
                <select
                  value={selectedMonth}
                  onChange={(event) => updateFilter(setMonth)(event.target.value)}
                  className="h-8 min-w-[130px] appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-[12px] font-semibold text-blue-700 outline-none focus:border-blue-500"
                >
                  {monthOptions.map((option) => (
                    <option key={option} value={option}>
                      {monthLabel(option)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              </label>
            )}
            <FilterSelect
              value={region}
              onChange={updateFilter(setRegion)}
              allLabel="All Regions"
              options={regionOptions}
              disabled={!regionOptions.length}
            />
            <FilterSelect value={collector} onChange={updateFilter(setCollector)} allLabel="All Collectors" options={collectorOptions} />
            <PeriodSelect value={period} onChange={setPeriod} />
          </div>
        </section>

        <PtpKpiCards kpis={analytics.kpis} />

        <section className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <h2 className="text-[14px] font-bold text-slate-800">
            {activeTab === "All" ? "All Promises" : `${activeTab} Promises`}
            <span className="ml-2 text-[12px] font-medium text-slate-500">{visibleRecords.length} records</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white pl-3 pr-2 text-[12px] font-medium text-slate-600">
              Promise Date
              <input
                type="date"
                value={promiseDate}
                onChange={(event) => updateFilter(setPromiseDate)(event.target.value)}
                className="bg-transparent text-[12px] text-slate-700 outline-none"
                aria-label="Filter by promise date"
              />
              {promiseDate && (
                <button type="button" aria-label="Clear promise date" onClick={() => updateFilter(setPromiseDate)("")} className="text-slate-400 hover:text-slate-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </label>
            <label className="relative inline-flex">
              <span className="sr-only">Records per page</span>
              <select
                value={pageSize}
                onChange={(event) => updateFilter(setPageSize)(Number(event.target.value))}
                className="h-8 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-[12px] font-semibold text-slate-700 outline-none"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            </label>
          </div>
        </section>

        <PromiseToPayCard records={visibleRecords} page={safePage} pageSize={pageSize} onPageChange={setPage} />

        <PtpCharts analytics={analytics} period={period} onPeriodChange={setPeriod} />
        {/* Remount on filter change so the table's internal pagination resets to page 1. */}
        <PromiseToPayTable key={`${activeTab}|${collector}|${region}|${promiseDate}`} records={visibleRecords} />

      </div>
    </main>
  );
}
