"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import PromiseToPayCard from "@/components/promiseToPay/PromiseToPayCard";
import PromiseToPayTable from "@/components/promiseToPay/PromiseToPayTable";
import { LoadingState } from "@/components/common/LoadingState";
import { getPromiseToPay } from "@/app/lib/api";

// Fallback static data for local testing
const promiseToPayData = {
  filters: [
    { label: "All", count: 3 },
    { label: "Active", count: 3 },
    { label: "Due Soon", count: 2 },
    { label: "Broken", count: 2 },
    { label: "Fulfilled", count: 1 },
  ],
  records: [
    {
      customer: "Dynamic Solutions Corp",
      invoice: "INV-2024-7823",
      amount: "$160K",
      created: "2026-09-10",
      promiseDate: "2026-10-22",
      dueDate: "2026-10-22",
      status: "Active",
      owner: "Mark Davis",
      initials: "MD",
      avatar: "bg-[#214cad]",
      note: "ERP system causing delay. Management committed.",
      followUp: "2026-10-15",
    },
    {
      customer: "Vertex Technologies",
      invoice: "INV-2024-6541",
      amount: "$234K",
      created: "2026-09-05",
      promiseDate: "2026-10-05",
      dueDate: "2026-10-05",
      status: "Active",
      owner: "James Wilson",
      initials: "JW",
      avatar: "bg-[#214cad]",
      note: "Full balance. Venture funding received.",
      followUp: "2026-09-28",
    },
    {
      customer: "Acme Manufacturing Ltd",
      invoice: "INV-2024-5234",
      amount: "$180K",
      created: "2026-09-01",
      promiseDate: "2026-10-15",
      dueDate: "2026-10-15",
      status: "Active",
      owner: "Sarah Chen",
      initials: "SC",
      avatar: "bg-[#214cad]",
      note: "Partial payment. Rest by Nov 1.",
      followUp: "2026-10-08",
    },
  ],
};

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
  const [status, setStatus] = useState("Active");
  const [activeFilter, setActiveFilter] = useState("Active");

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

  const resolvedPromiseData =
    promiseApiData?.promiseToPay ??
    promiseApiData ??
    promiseToPayData;

  const records = useMemo(() => {
    return (resolvedPromiseData?.records ?? []).filter(
      (record) =>
        (record?.customer ?? "")
          .toLowerCase?.()
          .includes(query.toLowerCase()) &&
        (status === "All" || record?.status === status) &&
        (activeFilter === "All" ||
          record?.status === activeFilter)
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
            options={[
              "Active",
              "Due Soon",
              "Broken",
              "Fulfilled",
            ]}
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