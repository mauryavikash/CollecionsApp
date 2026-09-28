"use client";

import React, { useState } from "react";
import {
  MoreVertical,
  SlidersHorizontal,
} from "lucide-react";

import { Button } from "@/components/common/Button";

export default function DataTable({
  tabs = [],
  filters = [],
  columns = [],
  data = [],
  onRowClick,
}) {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const renderCell = (column, row) => {
    switch (column.key) {
      case "caseId":
        return (
          <button
            onClick={() => onRowClick?.(row)}
            className="font-semibold text-blue-600"
          >
            {row.caseId}
          </button>
        );

      case "caseType":
        return (
          <span className="rounded-full bg-violet-100 px-2 py-1 text-xs text-violet-700">
            {row.caseType}
          </span>
        );

      case "priority":
        return (
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                row.priority === "High"
                  ? "bg-red-500"
                  : row.priority === "Medium"
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
            />
            {row.priority}
          </div>
        );

      case "status":
        return (
          <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
            {row.status}
          </span>
        );

      case "slaDue":
        return (
          <>
            <div>{row.slaDue}</div>
            <div className="text-xs text-orange-500">
              {row.remaining}
            </div>
          </>
        );

      default:
        return row[column.key];
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border bg-white">

      {/* TABS */}

      <div className="border-b px-5">
        <div className="flex gap-5 overflow-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* FILTERS */}

      <div className="border-b p-5">

        <div className="grid grid-cols-6 gap-3">

          {filters.map((filter) => (
            <div key={filter.key}>
              <label className="mb-1 block text-xs text-slate-500">
                {filter.label}
              </label>

              <select className="w-full rounded-lg border px-3 py-2 text-sm">
                {filter.options.map((option) => (
                  <option key={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <div className="flex items-end gap-2">
            <Button
              icon={SlidersHorizontal}
              variant="secondary"
            >
              More Filters
            </Button>

            <button className="text-blue-600 text-sm">
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}

      <div className="overflow-x-auto">

        <table className="w-full min-w-[1200px]">

          <thead className="bg-slate-50">
            <tr>

              <th className="px-4 py-3">
                <input type="checkbox" />
              </th>

              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-[11px] font-bold text-slate-500"
                >
                  {column.label}
                </th>
              ))}

              <th />
            </tr>
          </thead>

          <tbody>

            {data.map((row) => (
              <tr
                key={row.caseId}
                className="border-t hover:bg-slate-50"
              >
                <td className="px-4 py-4">
                  <input type="checkbox" />
                </td>

                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-4 py-4 text-sm"
                  >
                    {renderCell(column, row)}
                  </td>
                ))}

                <td className="px-4 py-4">
                  <button>
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

      {/* FOOTER */}

      <div className="flex items-center justify-between border-t px-5 py-4">

        <p className="text-sm text-slate-500">
          Showing 1 to {data.length} of 4,723 cases
        </p>

        <div className="flex items-center gap-2">

          <button className="h-8 w-8 rounded border">
            &lt;
          </button>

          <button className="h-8 w-8 rounded bg-blue-600 text-white">
            1
          </button>

          <button className="h-8 w-8 rounded border">
            2
          </button>

          <button className="h-8 w-8 rounded border">
            3
          </button>

          <button className="h-8 w-8 rounded border">
            &gt;
          </button>

          <select className="rounded border px-3 py-1">
            <option>10 / page</option>
          </select>

        </div>
      </div>
    </div>
  );
}