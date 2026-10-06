import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

export default function CompactDataTable({
  title,
  subtitle,
  data = [],
  columns = [],
  footerText,
  footerActionText,
  onFooterAction,
  className = "",
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div
      className={`flex h-full w-full flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm sm:p-5 ${className}`}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-3">
          {title && (
            <h3 className="text-sm font-bold tracking-tight text-slate-800">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-slate-100 text-slate-400"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-2 py-2 text-[11px] font-semibold first:pl-0"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-2 py-2.5 align-middle text-slate-600 first:pl-0"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {(footerText || footerActionText) && (
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
          {footerText ? (
            <span className="text-xs text-slate-500">{footerText}</span>
          ) : (
            <span />
          )}

          {footerActionText && (
            <button
              type="button"
              onClick={onFooterAction}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              {footerActionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
