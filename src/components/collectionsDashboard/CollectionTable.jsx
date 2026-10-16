"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const statusClasses = {
  Paid: "bg-emerald-50 text-emerald-600",
  Active: "bg-blue-50 text-blue-600",
  Pending: "bg-amber-50 text-amber-600",
  Broken: "bg-rose-50 text-rose-600",
  Partial: "bg-amber-50 text-amber-600",
  Fulfilled: "bg-emerald-50 text-emerald-600",
};

export default function CollectionTable({ activity = [] }) {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    setPage(1);
  }, [activity]);

  const totalPages = Math.max(
    1,
    Math.ceil(activity.length / pageSize)
  );

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return activity.slice(start, start + pageSize);
  }, [activity, page]);

  return (
    <section className="rounded-[11px] border border-slate-200 bg-white px-3 py-2.5 shadow-[0_2px_5px_rgba(38,82,144,.08)]">
      <div className="mb-2 flex justify-between">
        <h2 className="text-[11px] font-bold">
          RECENT PROMISE-TO-PAY (PTP) ACTIVITY
        </h2>
      </div>

      <div className="overflow-x-auto rounded-md border border-slate-200">
        <table className="w-full min-w-[680px] text-left text-[12px]">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {[
                "Customer",
                "PTP Amount",
                "Promise Date",
                "Status",
                "Owner",
              ].map((label) => (
                <th
                  key={label}
                  className="px-2.5 py-2 font-semibold"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr
                  key={`${item.customer}-${item.promiseDate}`}
                  className="border-t border-slate-200 hover:bg-slate-50"
                >
                  <td className="px-2.5 py-2.5 font-semibold text-blue-600">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/account?id=${item.id}`)
                      }
                      className="cursor-pointer hover:text-blue-800"
                    >
                      {item.customer}
                    </button>
                  </td>

                  <td className="px-2.5 py-2.5 font-bold">
                    {item.amount}
                  </td>

                  <td className="px-2.5 py-2.5 text-slate-500">
                    {item.promiseDate}
                  </td>

                  <td className="px-2.5 py-2.5">
                    <span
                      className={`rounded px-2 py-0.5 font-semibold ${
                        statusClasses[item.status] ??
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="px-2.5 py-2.5 text-slate-600">
                    {item.owner}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-3 flex items-center justify-between">
        <div className="text-[10px] text-slate-500">
          {activity.length > 0
            ? `Showing ${(page - 1) * pageSize + 1} to ${Math.min(
                page * pageSize,
                activity.length
              )} of ${activity.length} records`
            : "Showing 0 records"}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              setPage((prev) => Math.max(1, prev - 1))
            }
            disabled={page === 1}
            className="flex h-6 w-6 items-center justify-center rounded border border-slate-300 text-[10px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ‹
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => index + 1
          ).map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => setPage(pageNumber)}
              className={`flex h-6 w-6 items-center justify-center rounded text-[10px] ${
                page === pageNumber
                  ? "bg-blue-600 text-white"
                  : "border border-slate-300 text-slate-700"
              }`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            onClick={() =>
              setPage((prev) =>
                Math.min(totalPages, prev + 1)
              )
            }
            disabled={page === totalPages}
            className="flex h-6 w-6 items-center justify-center rounded border border-slate-300 text-[10px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}