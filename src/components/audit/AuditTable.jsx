"use client";
import React, { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

const actionClass = (action) => {
  switch (action) {
    case "Confirmed":
      return "bg-[#D1FAE5] text-[#10B981]";
    case "Rejected":
      return "bg-[#FEE2E2] text-[#EF4444]";
    case "Escalated":
      return "bg-[#FEF3C7] text-[#F59E0B]";
    default:
      return "bg-[#F1F5F9] text-[#64748B]";
  }
};

const initials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function FilterSelect({ label, children, ...props }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-[#475569] mb-1.5">
        {label}
      </p>

      <select
        {...props}
        className="w-full h-9 rounded-xl border border-[#D9E1EA] px-3 text-[12px] text-[#334155] bg-white"
      >
        {children}
      </select>
    </div>
  );
}

export const AuditTable = ({ data }) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dateFilter, setDateFilter] = useState("All Dates");
  const [reviewerFilter, setReviewerFilter] = useState("All Reviewers");
  const [vendorFilter, setVendorFilter] = useState("All Vendors");
  const [actionFilter, setActionFilter] = useState("All Actions");
  const [reasonFilter, setReasonFilter] = useState("All Reasons");
  const pageSize = 10;

  const auditData = useMemo(() => Array.isArray(data?.records)
    ? data.records.map((item) => {
        let reasonDetails = {};

        try {
          reasonDetails = JSON.parse(item.reason);
        } catch {
          // API reasons may be plain text rather than JSON.
        }

        const timestamp = new Date(item.timestamp);
        return {
          id: item.auditId,
          timestamp: timestamp.toLocaleString(),
          dateKey: Number.isNaN(timestamp.getTime()) ? "Unknown date" : timestamp.toLocaleDateString(),
          reviewer: item.reviewer ?? "System",
          vendor: reasonDetails.vendor ?? reasonDetails.vendor_name ?? "Unassigned",
          action: item.action,
          reason: item.reason || "-",
          clusterId: item.clusterId ?? "-",
          comments: item.comments,
          reversal: item.reversal ?? "-",
        };
      })
    : [], [data]);
  const totalRecords = data?.totalRecords ?? auditData.length;
  const dateOptions = useMemo(() => [...new Set(auditData.map((item) => item.dateKey))], [auditData]);
  const reviewerOptions = useMemo(() => [...new Set(auditData.map((item) => item.reviewer))], [auditData]);
  const vendorOptions = useMemo(() => [...new Set(auditData.map((item) => item.vendor))], [auditData]);
  const actionOptions = useMemo(() => [...new Set(auditData.map((item) => item.action))], [auditData]);
  const reasonOptions = useMemo(() => [...new Set(auditData.map((item) => item.reason))], [auditData]);

  const filteredData = useMemo(() => {
    return auditData.filter((item) => {
      const matchesSearch = Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesDate = dateFilter === "All Dates" || item.dateKey === dateFilter;
      const matchesReviewer = reviewerFilter === "All Reviewers" || item.reviewer === reviewerFilter;
      const matchesVendor = vendorFilter === "All Vendors" || item.vendor === vendorFilter;

      const matchesAction =
        actionFilter === "All Actions" || item.action === actionFilter;

      const matchesReason =
        reasonFilter === "All Reasons" || item.reason === reasonFilter;

      return matchesSearch && matchesDate && matchesReviewer && matchesVendor && matchesAction && matchesReason;
    });
  }, [search, dateFilter, reviewerFilter, vendorFilter, actionFilter, reasonFilter, auditData]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const updateFilter = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  return (
    <div className="col-span-12 lg:col-span-9 flex">
      <div
        className="
          w-full
          h-full
          flex
          flex-col
          bg-white
          rounded-[16px]
          border
          border-[#D9E1EA]
          shadow-[0px_2px_8px_rgba(15,23,42,0.05)]
          overflow-hidden
        "
      >
        <div className="px-4 pt-4">
          <h2 className="text-[15px] font-semibold text-[#0F172A]">
            Decision Audit Trail
          </h2>
        </div>

        {/* Filters */}
        <div className="px-4 py-4 border-b border-[#E2E8F0]">
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
            <FilterSelect label="Date Range" value={dateFilter} onChange={updateFilter(setDateFilter)}>
              <option>All Dates</option>
              {dateOptions.map((date) => <option key={date}>{date}</option>)}
            </FilterSelect>

            <FilterSelect
              label="Reviewer"
              value={reviewerFilter}
              onChange={updateFilter(setReviewerFilter)}
            >
              <option>All Reviewers</option>
              {reviewerOptions.map((reviewer) => <option key={reviewer}>{reviewer}</option>)}
            </FilterSelect>

            <FilterSelect
              label="Vendor"
              value={vendorFilter}
              onChange={updateFilter(setVendorFilter)}
            >
              <option>All Vendors</option>
              {vendorOptions.map((vendor) => <option key={vendor}>{vendor}</option>)}
            </FilterSelect>

            <FilterSelect
              label="Action Type"
              value={actionFilter}
              onChange={updateFilter(setActionFilter)}
            >
              <option>All Actions</option>
              {actionOptions.map((action) => <option key={action}>{action}</option>)}
            </FilterSelect>

            <FilterSelect
              label="Reason"
              value={reasonFilter}
              onChange={updateFilter(setReasonFilter)}
            >
              <option>All Reasons</option>
              {reasonOptions.map((reason) => <option key={reason}>{reason}</option>)}
            </FilterSelect>

            <div>
              <p className="text-[11px] font-semibold text-[#475569] mb-1.5">
                Comments
              </p>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search..."
                    className="w-full h-9 rounded-xl border border-[#D9E1EA] bg-white pl-8 pr-2 text-[12px] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none"
                  />
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto flex-1 min-h-[260px]">
          <table className="w-full">
            <thead>
              <tr className="h-[42px] border-b border-[#E2E8F0]">
                {[
                  "TIMESTAMP",
                  "REVIEWER",
                  "ACTION",
                  "REASON",
                  "CLUSTER ID",
                  "COMMENTS",
                  "REVERSAL",
                ].map((item) => (
                  <th
                    key={item}
                    scope="col"
                    className="
                      px-4
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
              </tr>
            </thead>

            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-[13px] text-[#94A3B8]"
                  >
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr
                    key={row.id}
                    tabIndex={0}
                    className="h-[46px] border-b border-[#E2E8F0] hover:bg-[#F8FAFC] focus-within:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="px-4 text-[12px] text-[#334155] whitespace-nowrap">
                      {row.timestamp}
                    </td>

                    <td className="px-4">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-[9px] font-semibold shrink-0">
                          {initials(row.reviewer)}
                        </span>
                        <span className="text-[12px] text-[#334155] whitespace-nowrap">
                          {row.reviewer}
                        </span>
                      </div>
                    </td>

                    <td className="px-4">
                      <span
                        className={`px-2.5 py-[2px] rounded-md text-[10px] font-semibold ${actionClass(
                          row.action
                        )}`}
                      >
                        {row.action}
                      </span>
                    </td>

                    <td className="px-4 text-[12px] text-[#334155] whitespace-nowrap">
                      {row.reason}
                    </td>

                    <td className="px-4">
                      <a
                        href={`/audit/clusters/${row.clusterId.replace("#", "")}`}
                        className="text-[12px] font-semibold text-[#2563EB] hover:underline"
                      >
                        {row.clusterId}
                      </a>
                    </td>

                    <td className="px-4 text-[12px] text-[#94A3B8]">
                      {row.comments || "-"}
                    </td>

                    <td className="px-4 text-[12px] text-[#334155]">
                      {row.reversal}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-[#E2E8F0] px-4 py-3 flex items-center justify-between">
          <div className="text-[12px] text-[#64748B]">
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, filteredData.length)} of{" "}
            {filteredData.length.toLocaleString()} of {totalRecords.toLocaleString()} audit records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="w-7 h-7 rounded-lg border border-[#D9E1EA] text-[#475569] disabled:opacity-40"
            >
              ‹
            </button>

            {visiblePages.map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                aria-current={page === p ? "page" : undefined}
                className={`w-7 h-7 rounded-lg text-[12px] font-medium ${
                  page === p
                    ? "bg-[#2563EB] text-white"
                    : "border border-[#D9E1EA] text-[#475569]"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
              className="w-7 h-7 rounded-lg border border-[#D9E1EA] text-[#475569] disabled:opacity-40"
            >
              ›
            </button>

            <select className="h-7 rounded-lg border border-[#D9E1EA] px-2 text-[12px]" value={pageSize} disabled>
              <option value={10}>10 / page</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};