
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MoreVertical, RefreshCw, TriangleAlert } from "lucide-react";
import { RecoveriesKpiCards } from "@/components/recoveries/RecoveriesKpiCards";
import { RecoveriesDetails } from "@/components/recoveries/RecoveriesDetails";
import { RecoveriesHeader } from "@/components/recoveries/RecoveriesHeader";
import RecoveriesCharts from "@/components/recoveries/RecoveriesCharts";
import RecoveryPipelineOverview from "@/components/recoveries/RecoveryPipelineOverview";
import { LoadingState } from "@/components/common/LoadingState";
import { getRecoveries } from "@/app/lib/api";

const TABS = [
  "All Recoveries",
  "In Progress",
  "Completed",
  "Failed",
  // "Written Off",
  // "Prevention (Duplicates Stopped)",
];

const formatCurrency = (value) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
}).format(Number(value ?? 0));

const formatDate = (value) => value ? new Date(value).toLocaleDateString() : "-";

function normalizeRecovery(recovery) {
  if (!recovery) {
    return null;
  }

  return {
    ...recovery,
    recoveryId: `REC-${String(recovery.recoveryId).padStart(8, "0")}`,
    type: recovery.type?.includes("DUPLICATE") ? "Duplicate" : "Anomaly",
    status: recovery.status === "CLOSED" ? "Completed" : recovery.status,
    vendor: recovery.vendor || "-",
    relatedCaseId: recovery.relatedCaseId ?? "-",
    amount: formatCurrency(recovery.amount),
    recoveryDate: formatDate(recovery.recoveredOn),
    slaDue: recovery.slaDue ? formatDate(recovery.slaDue) : "-",
    investigator: recovery.investigator ?? "Unassigned",
  };
}

const statusClass = (status) => {
  switch (status) {
    case "Completed":
      return "bg-[#D1FAE5] text-[#10B981]";
    case "In Progress":
      return "bg-[#DBEAFE] text-[#2563EB]";
    case "Failed":
      return "bg-[#FEE2E2] text-[#EF4444]";
    case "Written Off":
      return "bg-[#F1F5F9] text-[#64748B]";
    default:
      return "bg-[#F1F5F9] text-[#64748B]";
  }
};

function FilterSelect({ label, children, ...props }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-[#475569] mb-2">{label}</p>
      <select
        {...props}
        className="w-full h-9 rounded-xl border border-[#D9E1EA] px-3 text-[13px] text-[#334155] bg-white"
      >
        {children}
      </select>
    </div>
  );
}

export default function Recoveries() {
  const [activeTab, setActiveTab] = useState("All Recoveries");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [investigatorFilter, setInvestigatorFilter] = useState("All");
  const [recoveriesData, setRecoveriesData] = useState(null);
  const [selectedRecovery, setSelectedRecovery] = useState(null);
  const pageSize = 8;

  useEffect(() => {
    let isMounted = true;

    getRecoveries().then((data) => {
      if (isMounted) {
        const payload = data?.data ?? data;
        setRecoveriesData(payload);
        setSelectedRecovery(normalizeRecovery(payload.recoveryDetails));
      }
    }).catch(() => {
      if (isMounted) {
        setRecoveriesData({});
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const recoveryData = useMemo(() => {
    const recovery = normalizeRecovery(recoveriesData?.recoveryDetails);
    return recovery ? [recovery] : [];
  }, [recoveriesData]);

  const filteredData = useMemo(() => {
    return recoveryData.filter((item) => {
      const matchesSearch = Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesTab =
        activeTab === "All Recoveries" || item.status === activeTab;

      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const matchesType = typeFilter === "All" || item.type === typeFilter;
      const matchesInvestigator =
        investigatorFilter === "All" || item.investigator === investigatorFilter;

      return (
        matchesSearch &&
        matchesTab &&
        matchesStatus &&
        matchesType &&
        (sourceFilter === "All" || item.sourceSystem === sourceFilter) &&
        matchesInvestigator
      );
    });
  }, [search, activeTab, statusFilter, typeFilter, sourceFilter, investigatorFilter, recoveryData]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  if (!recoveriesData) {
    return <LoadingState label="Loading recoveries..." />;
  }

  return (
    <div>
      {/* HEADER */}
      <RecoveriesHeader />
      {/* KPI */}
      <div className="mt-4">
        <RecoveriesKpiCards data={recoveriesData.recoveryKpis} />
      </div>

      {/* Recovery overview and selected recovery */}
      <div className="mt-4">
        <RecoveryPipelineOverview
          pipeline={recoveriesData.recoveryPipeline}
          aging={recoveriesData.recoveryAging}
          priorities={recoveriesData.recoveriesByPriority}
          metrics={recoveriesData.recoveryMetrics}
        />

        <div className="mt-4 grid grid-cols-12 gap-4">
          {/* CONTENT */}
          <div className="col-span-12 lg:col-span-8">
          <div
            className="
            h-full
            bg-white
            rounded-[16px]
            border
            border-[#D9E1EA]
            shadow-[0px_2px_8px_rgba(15,23,42,0.05)]
            overflow-hidden
            "
            >
            {/* Tabs */}
            <div className="px-5 pt-4 border-b border-[#E2E8F0] overflow-x-auto">
              <div className="flex gap-5 whitespace-nowrap">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setPage(1);
                    }}
                    className={`pb-3 text-[13px] font-medium transition-all ${
                      activeTab === tab
                        ? "text-[#2563EB] border-b-2 border-[#2563EB]"
                        : "text-[#475569]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <FilterSelect
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option>All</option>
                  <option>Completed</option>
                  <option>In Progress</option>
                  <option>Failed</option>
                  <option>Written Off</option>
                </FilterSelect>

                <FilterSelect
                  label="Recovery Type"
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option>All</option>
                  <option>Duplicate</option>
                  <option>Anomaly</option>
                </FilterSelect>

                <FilterSelect
                  label="Source"
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                >
                  <option>All</option>
                  <option>SAP</option>
                  <option>Oracle</option>
                </FilterSelect>

                <FilterSelect label="Vendor">
                  <option>Select vendor</option>
                </FilterSelect>

                <FilterSelect
                  label="Investigator"
                  value={investigatorFilter}
                  onChange={(e) => {
                    setInvestigatorFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option>All</option>
                  <option>Sarah Johnson</option>
                  <option>Michael Brown</option>
                  <option>Priya Nair</option>
                  <option>David Lee</option>
                  <option>Emma Wilson</option>
                </FilterSelect>

                <div className="flex items-end">
                  <button className="h-9 w-full px-4 rounded-xl border border-[#D9E1EA] text-[12px] font-medium text-[#475569]">
                    More Filters
                  </button>
                </div>
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto flex-1 min-h-[550px]">
              <table className="w-full">
                <thead>
                  <tr className="h-[42px] border-b border-[#E2E8F0]">
                    <th className="w-12 px-5">
                      <input type="checkbox" aria-label="Select all recoveries" />
                    </th>

                    {[
                      "RECOVERY ID",
                      "TYPE",
                      "STATUS",
                      "VENDOR",
                      "RELATED CASE ID",
                      "AMOUNT (USD)",
                      "RECOVERY DATE",
                      "SLA DUE",
                      "INVESTIGATOR",
                    ].map((item) => (
                      <th
                        key={item}
                        className="px-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B] whitespace-nowrap"
                      >
                        {item}
                      </th>
                    ))}

                    <th className="w-10" />
                  </tr>
                </thead>

                <tbody>
                  {filteredData.map((row) => (
                    <tr
                      key={row.recoveryId}
                      onClick={() => setSelectedRecovery(row)}
                      className={`h-[52px] border-b border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer transition-colors ${
                        selectedRecovery?.recoveryId === row.recoveryId
                          ? "bg-[#F8FAFC]"
                          : ""
                      }`}
                    >
                      <td className="px-5">
                        <input
                          type="checkbox"
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Select recovery ${row.recoveryId}`}
                        />
                      </td>

                      <td className="px-3 text-[12px] font-semibold text-[#2563EB] whitespace-nowrap">
                        {row.recoveryId}
                      </td>

                      <td className="px-3">
                        <div className="flex items-center gap-1.5 text-[12px] text-[#334155] whitespace-nowrap">
                          {row.type === "Duplicate" ? (
                            <RefreshCw size={12} className="text-[#3B82F6]" />
                          ) : (
                            <TriangleAlert size={12} className="text-[#F59E0B]" />
                          )}
                          {row.type}
                        </div>
                      </td>

                      <td className="px-3">
                        <span
                          className={`px-2.5 py-[2px] rounded-md text-[10px] font-semibold whitespace-nowrap ${statusClass(
                            row.status
                          )}`}
                        >
                          {row.status}
                        </span>
                      </td>

                      <td className="px-3 text-[12px] text-[#334155] whitespace-nowrap">
                        {row.vendor}
                      </td>

                      <td className="px-3 text-[12px] font-medium text-[#2563EB] whitespace-nowrap">
                        {row.relatedCaseId}
                      </td>

                      <td className="px-3 text-[12px] font-semibold text-[#0F172A] whitespace-nowrap">
                        {row.amount}
                      </td>

                      <td className="px-3 text-[12px] text-[#64748B] whitespace-nowrap">
                        {row.recoveryDate}
                      </td>

                      <td className="px-3 whitespace-nowrap">
                        <div className="text-[12px] text-[#334155]">{row.slaDue}</div>
                        {row.slaState && (
                          <div
                            className={`text-[10px] font-semibold ${
                              row.slaState === "Overdue"
                                ? "text-[#EF4444]"
                                : "text-[#F59E0B]"
                            }`}
                          >
                            {row.slaState}
                          </div>
                        )}
                      </td>

                      <td className="px-3 text-[12px] text-[#64748B] whitespace-nowrap">
                        {row.investigator}
                      </td>

                      <td className="pr-4">
                        <MoreVertical size={15} className="text-[#94A3B8]" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="border-t border-[#E2E8F0] px-5 py-3 flex items-center justify-between flex-wrap gap-2">
              <div className="text-[12px] text-[#64748B]">
                Showing {(page - 1) * pageSize + 1} to{" "}
                {Math.min(page * pageSize, filteredData.length)} of{" "}
                {filteredData.length.toLocaleString()} recoveries
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="w-7 h-7 rounded-lg border border-[#D9E1EA] text-[#475569]"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-7 h-7 rounded-lg text-[12px] font-medium ${
                      page === n
                        ? "bg-[#2563EB] text-white"
                        : "border border-[#D9E1EA] text-[#475569]"
                    }`}
                  >
                    {n}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="w-7 h-7 rounded-lg border border-[#D9E1EA] text-[#475569]"
                >
                  ›
                </button>

                <select className="h-7 rounded-lg border border-[#D9E1EA] px-2 text-[12px]">
                  <option>10 / page</option>
                </select>
              </div>
            </div>
          </div>

          {/* <RecoveriesCharts
            summary={recoveriesData.recoverySummary}
            trend={recoveriesData.recoveryTrend}
            vendors={recoveriesData.vendorRecoveries}
          /> */}
          </div>

          <div className="col-span-12 lg:col-span-4">
            <RecoveriesDetails
              recovery={selectedRecovery}
              stages={recoveriesData.recoveryProgressStages}
              timeline={recoveriesData.recoveryTimeline}
              tabs={recoveriesData.detailTabs}
            />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-4">
        <RecoveriesCharts
        summary={recoveriesData.recoverySummary}
        trend={recoveriesData.recoveryTrend}
        vendors={recoveriesData.vendorRecoveries}
        />
        </div>
      </div>
    </div>
  );
}

