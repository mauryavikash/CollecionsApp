"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  MoreVertical,
} from "lucide-react";
import {CasesKpiCards} from "@/components/cases/CasesKpiCards";
import {CasesDetails} from "@/components/cases/CasesDetails";
import {CasesHeader} from "@/components/cases/CasesHeader";
import CasesAnalyticsRow from "@/components/cases/CasesAnalyticsRow";
import { LoadingState } from "@/components/common/LoadingState";
import { getCases } from "@/app/lib/api";

function FilterSelect({ label, children, ...props }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-[#475569] mb-2">{label}</p>
      <select
        {...props}
        className="w-full h-9 rounded-xl border border-[#D9E1EA] px-3 text-[13px] text-[#334155]"
      >
        {children}
      </select>
    </div>
  );
}

export default function CasesPage() {
  const [activeTab, setActiveTab] = useState("All Cases");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [caseTypeFilter, setCaseTypeFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [investigatorFilter, setInvestigatorFilter] = useState("All");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [casesData, setCasesData] = useState(null);
  const pageSize = 10;
  const TABS = [
    "All Cases",
    "Duplicate Cases",
    "Anomaly Cases",
    "Escalated Cases",
    "My Assignments",
    "Watchlist",
  ];

  useEffect(() => {
    let isMounted = true;

    getCases().then((data) => {
      if (isMounted) {
        setCasesData(data?.data ?? data);
      }
    }).catch(() => {
      if (isMounted) {
        setCasesData({ caseDetails: [], caseKpis: [], casesOverview: {} });
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const tableData = useMemo(
    () => casesData?.caseDetails ?? [],
    [casesData]
  );
  const statusOptions = useMemo(() => [...new Set(tableData.map((item) => item.status))], [tableData]);
  const caseTypeOptions = useMemo(() => [...new Set(tableData.map((item) => item.caseType))], [tableData]);
  const priorityOptions = useMemo(() => [...new Set(tableData.map((item) => item.priority))], [tableData]);
  const investigatorOptions = useMemo(() => [...new Set(tableData.map((item) => item.investigator ?? "Unassigned"))], [tableData]);
  const vendorOptions = useMemo(() => [...new Set(tableData.map((item) => item.vendor || "Unassigned"))], [tableData]);

  const filteredData = useMemo(() => {
  return tableData.filter((item) => {
    const matchesSearch = Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      item.status === statusFilter;

    const matchesType =
      caseTypeFilter === "All" ||
      item.caseType === caseTypeFilter;

    const matchesPriority =
      priorityFilter === "All" ||
      item.priority === priorityFilter;
    const investigator = item.investigator ?? "Unassigned";
    const vendor = item.vendor || "Unassigned";
    const matchesInvestigator = investigatorFilter === "All" || investigator === investigatorFilter;
    const matchesVendor = vendorFilter === "All" || vendor === vendorFilter;
    const matchesTab = activeTab === "All Cases"
      || (activeTab === "Duplicate Cases" && item.caseType?.includes("DUPLICATE"))
      || (activeTab === "Anomaly Cases" && item.caseType?.includes("ANOMALY"))
      || (activeTab === "Escalated Cases" && item.status?.includes("ESCALATED"))
      || (activeTab === "My Assignments" && investigator !== "Unassigned")
      || (activeTab === "Watchlist" && item.watchlist === true);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesType &&
      matchesPriority &&
      matchesInvestigator &&
      matchesVendor &&
      matchesTab
    );
  });
}, [
  search,
  statusFilter,
  caseTypeFilter,
  priorityFilter,
  investigatorFilter,
  vendorFilter,
  activeTab,
  tableData,
]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

 const statusClass = (status) => {
  switch (status) {
    case "In Progress":
      return "bg-[#DBEAFE] text-[#2563EB]";

    case "Pending Review":
      return "bg-[#FDE7C7] text-[#F59E0B]";

    case "Escalated":
      return "bg-[#FEE2E2] text-[#EF4444]";

    case "Open":
      return "bg-[#D1FAE5] text-[#10B981]";

    default:
      return "";
  }
};

  const updateFilter = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  const [selectedCase, setSelectedCase] = useState(null);

  if (!casesData) {
    return <LoadingState label="Loading cases..." />;
  }

  return (
    <div>
      {/* HEADER */}
       <CasesHeader/>
      {/* KPI */}
      <CasesKpiCards data={casesData.caseKpis} />
      {/* CONTENT */}
      <div className="grid grid-cols-12 gap-4 mt-4 items-stretch">

        {/* TABLE */}
        <div className="col-span-12 lg:col-span-8 flex">

          <div
            className="
              w-full
              h-full
              flex
              flex-col
              bg-white
              rounded-[20px]
              border
              border-[#D9E1EA]
              shadow-[0px_2px_8px_rgba(15,23,42,0.05)]
              overflow-hidden
          "
          >

            {/* Tabs */}

            <div className="px-5 pt-4 border-b border-[#E2E8F0]">
              <div className="flex gap-5">
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

              <div className="grid grid-cols-6 gap-3">

                <FilterSelect
                  label="Status"
                  value={statusFilter}
                  onChange={updateFilter(setStatusFilter)}
                >
                  <option>All</option>
                  {statusOptions.map((status) => <option key={status}>{status}</option>)}
                </FilterSelect>

                <FilterSelect
                  label="Case Type"
                  value={caseTypeFilter}
                  onChange={updateFilter(setCaseTypeFilter)}
                >
                  <option>All</option>
                  {caseTypeOptions.map((caseType) => <option key={caseType}>{caseType}</option>)}
                </FilterSelect>

                <FilterSelect
                  label="Priority"
                  value={priorityFilter}
                  onChange={updateFilter(setPriorityFilter)}
                >
                  <option>All</option>
                  {priorityOptions.map((priority) => <option key={priority}>{priority}</option>)}
                </FilterSelect>

                <FilterSelect label="Investigator" value={investigatorFilter} onChange={updateFilter(setInvestigatorFilter)}>
                  <option>All</option>
                  {investigatorOptions.map((investigator) => <option key={investigator}>{investigator}</option>)}
                </FilterSelect>

                <FilterSelect label="Vendor" value={vendorFilter} onChange={updateFilter(setVendorFilter)}>
                  <option>All</option>
                  {vendorOptions.map((vendor) => <option key={vendor}>{vendor}</option>)}
                </FilterSelect>

                <div className="flex items-end gap-3">
                  <button className="h-9 px-4 rounded-xl border border-[#D9E1EA] text-[12px] font-medium text-[#475569]">
                    More Filters
                  </button>

                  <button
                    onClick={() => {
                      setStatusFilter("All");
                      setPriorityFilter("All");
                      setInvestigatorFilter("All");
                      setVendorFilter("All");
                      setCaseTypeFilter("All");
                      setSearch("");
                      setPage(1);
                    }}
                    className="text-[#2563EB] text-[12px] font-medium"
                  >
                    Reset
                  </button>
                </div>

              </div>
            </div>

            {/* TABLE */}

            <div className="table-scrollbar flex-1 min-h-[520px] overflow-x-scroll overflow-y-hidden">

              <table className="min-w-[1550px] w-full">

                <thead>

                  <tr className="h-[46px] border-b border-[#E2E8F0]">

                    <th className="w-12 px-5">
                      <input type="checkbox" />
                    </th>

                    {[
                      "CASE ID",
                      "CASE TYPE",
                      "PRIORITY",
                      "STATUS",
                      "VENDOR",
                      "AMOUNT (USD)",
                      "DETECTED ON",
                      "INVOICE DATE",
                      "INVOICE ID",
                      "INVOICE NUMBER",
                      // "CONFIDENCE SCORE",
                      "SIMILARITY",
                    ].map((item) => (
                      <th
                        key={item}
                        className="
                        text-left
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.08em]
                        text-[#64748B]
                      "
                      >
                        {item}
                      </th>
                    ))}

                    <th />
                  </tr>

                </thead>

                <tbody>

                  {paginatedData.length === 0 ? (
                    <tr><td colSpan={13} className="px-5 py-10 text-center text-[13px] text-[#94A3B8]">No matching cases found.</td></tr>
                  ) : paginatedData.map((row) => (

                    <tr
                      key={row.case_id}
                      onClick={() => setSelectedCase(row)}
                      className={`
                        h-[58px]
                        border-b
                        border-[#E2E8F0]
                        hover:bg-[#F8FAFC]
                        cursor-pointer
                        transition-colors
                        ${
                          selectedCase?.case_id === row.case_id
                            ? "bg-[#F8FAFC]"
                            : ""
                        }
                      `}
                    >

                      <td className="px-5">
                        <input type="checkbox" />
                      </td>

                      <td className="text-[12px] font-semibold text-[#2563EB]">
                        {row.case_id}
                      </td>

                      <td>
                        <span
                          className={`px-2.5 py-[2px] rounded-md text-[10px] font-semibold ${
                            row.case_type === "Duplicate"
                              ? "bg-[#F3E8FF] text-[#8B5CF6]"
                              : "bg-[#FDE7C7] text-[#F59E0B]"
                          }`}
                        >
                          {row.case_type}
                        </span>
                      </td>

                      <td>
                        <div className="flex items-center gap-2 text-[12px] text-[#334155]">

                          <span
                            className={`w-2 h-2 rounded-full ${
                              row.priority === "High"
                                ? "bg-red-500"
                                : row.priority === "Medium"
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                          />

                          {row.priority}

                        </div>
                      </td>

                      <td>
                        <span
                          className={`px-2.5 py-[2px] rounded-md text-[10px] font-semibold ${statusClass(
                            row.risk_level
                          )}`}
                        >
                          {row.risk_level}
                        </span>
                      </td>

                      <td className="text-[12px] text-[#334155]">
                        {row.vendor}
                      </td>

                      <td className="text-[12px] font-semibold text-[#0F172A]">
                        {row.invoice_1?.amount}
                      </td>

                      <td className="text-[12px] text-[#64748B]">
                        {row.detectedOn}
                      </td>

                      <td>
                        <div className="text-[12px] text-[#334155]">
                          {row.invoice_1?.invoice_date}
                        </div>
                        
                      </td>

                      <td className="text-[12px] text-[#64748B]">
                        {/* {row.investigator} */}
                        {row.invoice_1?.invoice_id}
                      </td>

                      <td className="text-[12px] text-[#64748B]">
                        {row.invoice_1?.invoice_number}
                      </td>

                      {/* <td className="text-[12px] font-semibold text-[#0F172A]">
                        {row.invoice_1?.confidenceScore}
                      </td> */}

                      <td className="text-[12px] font-semibold text-[#0F172A]">
                        {row.similarity}
                      </td>

                      <td className="pr-4">
                        <MoreVertical
                          size={15}
                          className="text-[#94A3B8]"
                        />
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            {/* Pagination */}

            <div className="border-t border-[#E2E8F0] px-5 py-3 flex items-center justify-between">

              <div className="text-[12px] text-[#64748B]">
                Showing {filteredData.length ? (page - 1) * pageSize + 1 : 0} to{" "}
                {Math.min(
                  page * pageSize,
                  filteredData.length
                )}
                {" "}of {filteredData.length} cases
              </div>

              <div className="flex items-center gap-2">

                <button onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))} disabled={page === 1} className="w-7 h-7 rounded-lg border border-[#D9E1EA] disabled:opacity-40">
                  ‹
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      setPage(index + 1)
                    }
                    className={`w-7 h-7 rounded-lg text-[12px] font-medium ${
                      page === index + 1
                        ? "bg-[#2563EB] text-white"
                        : "border border-[#D9E1EA] text-[#475569]"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))} disabled={page === totalPages} className="w-7 h-7 rounded-lg border border-[#D9E1EA] disabled:opacity-40">
                  ›
                </button>

                <select className="h-7 rounded-lg border border-[#D9E1EA] px-2 text-[12px]" value={pageSize} disabled>
                  <option value={10}>10 / page</option>
                </select>

              </div>

            </div>

          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="col-span-12 lg:col-span-4 flex">
          <CasesDetails caseData={selectedCase ?? tableData[0]} />
        </div>

      </div>

      <CasesAnalyticsRow data={casesData.casesOverview} />
    </div>
  );
}

