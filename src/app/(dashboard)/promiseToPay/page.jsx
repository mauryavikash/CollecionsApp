"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import PromiseToPayCard from "@/components/promiseToPay/PromiseToPayCard";
import PromiseToPayTable from "@/components/promiseToPay/PromiseToPayTable";
import { LoadingState } from "@/components/common/LoadingState";
import { getPromiseToPay } from "@/app/lib/api";

const DEFAULT_AVATAR_CLASS = "bg-[#214cad]";

function getInitials(value = "") {
  const words = String(value)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return "NA";
  }

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function withFallback(value, fallback = "-") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return value;
}

function normalizeStatusValue(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeRecord(record = {}) {
  const owner = record?.owner ?? record?.collectionOwner ?? "";
  const customer = record?.customer ?? "";

  return {
    customer: withFallback(customer),
    invoice: withFallback(record?.invoice),
    amount: withFallback(record?.amount ?? record?.ptpAmount),
    created: withFallback(record?.created ?? record?.creationDate),
    promiseDate: withFallback(record?.promiseDate),
    dueDate: withFallback(record?.dueDate),
    status: withFallback(record?.status, "Active"),
    owner: withFallback(owner),
    initials: withFallback(
      record?.initials,
      getInitials(owner || customer)
    ),
    avatar: withFallback(record?.avatar, DEFAULT_AVATAR_CLASS),
    note: withFallback(record?.note),
    followUp: withFallback(record?.followUp),
  };
}

function normalizePromiseToPayData(payload = {}) {
  const recordsSource =
    payload?.records ??
    payload?.promiseToPayRecords ??
    [];
  const records = recordsSource.map(normalizeRecord);

  const countsSource = payload?.filters ?? payload?.counts ?? [];
  const normalizedCounts = countsSource.map((item) => ({
    label: item?.label,
    count: Number(item?.count) || 0,
  }));

  if (normalizedCounts.length) {
    return { records, filters: normalizedCounts };
  }

  const statusCounts = records.reduce((acc, record) => {
    const status = record?.status;

    if (!status || status === "-") {
      return acc;
    }

    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    records,
    filters: [
      { label: "All", count: records.length },
      ...Object.entries(statusCounts).map(
        ([label, count]) => ({ label, count })
      ),
    ],
  };
}

function Select({ value, onChange, options, label }) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[25px] appearance-none rounded-md border border-slate-200 bg-white px-2 pr-6 text-[9px] text-slate-600 outline-none"
      >
        <option value="All">All</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
    </label>
  );
}

export default function PromiseToPayPage() {
  const [promiseApiData, setPromiseApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    let isMounted = true;

    async function loadPromiseToPay() {
      try {
        setLoading(true);
        setError(null);

        const response = await getPromiseToPay();
        const payload = response?.data ?? response;
        const hasPayload = Boolean(
          payload &&
          typeof payload === "object" &&
          Object.keys(payload)?.length
        );

        if (isMounted) {
          setPromiseApiData(hasPayload ? payload : null);
        }
      } catch (error) {
        console.error("Promise To Pay API Error:", error);
        if (isMounted) {
          setError(error);
          setPromiseApiData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPromiseToPay();

    return () => {
      isMounted = false;
    };
  }, []);

  const resolvedPromiseData = useMemo(() => {
    const payload =
      promiseApiData?.promiseToPay ??
      promiseApiData ??
      {};

    return normalizePromiseToPayData(payload);
  }, [promiseApiData]);

  const statusOptions = useMemo(() => {
    const fromFilters = (resolvedPromiseData?.filters ?? [])
      .map((filter) => filter?.label)
      .filter(
        (label) =>
          label &&
          label !== "All"
      );

    if (fromFilters.length) {
      return fromFilters;
    }

    return [
      "Active",
      "Due Soon",
      "Broken",
      "Fulfilled",
    ];
  }, [resolvedPromiseData]);

  const records = useMemo(() => {
    const normalizedStatus = normalizeStatusValue(status);
    const normalizedActiveFilter = normalizeStatusValue(activeFilter);

    return (resolvedPromiseData?.records ?? []).filter(
      (record) => {
        const recordStatus = normalizeStatusValue(record?.status);

        return (
        (record?.customer ?? "")
          .toLowerCase?.()
          .includes(query.toLowerCase()) &&
        (status === "All" || recordStatus === normalizedStatus) &&
        (activeFilter === "All" ||
          recordStatus === normalizedActiveFilter)
        );
      }
    );
  }, [query, status, activeFilter, resolvedPromiseData]);

  if (loading) {
    return <LoadingState label="Loading promise to pay data..." />;
  }

  return (
    <main className="min-h-full text-slate-700" aria-busy={loading} data-has-error={Boolean(error)}>
      <div className="mx-auto max-w-[1600px]">
        <header className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-[280px] flex-1">
            <span className="sr-only">
              Search promises to pay
            </span>

            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search by customer name..."
              className="h-[25px] w-full rounded-md border border-slate-200 bg-white pl-7 text-[10px] outline-none"
            />
          </label>

          <Select
            label="Status"
            value={status}
            onChange={setStatus}
            options={statusOptions}
          />

          <Select
            label="Owner"
            value="All"
            onChange={() => {}}
            options={[]}
          />

          <span className="rounded-md bg-white px-2 py-[6px] text-[9px] font-semibold text-slate-600">
            {records.length} records
          </span>
        </header>

        <PromiseToPayCard
          filters={resolvedPromiseData?.filters ?? []}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          records={records}
        />

        <PromiseToPayTable records={records} />
      </div>
    </main>
  );
}