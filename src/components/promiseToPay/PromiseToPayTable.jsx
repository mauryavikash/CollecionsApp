import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
export default function PromiseToPayTable({ records = [] }) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(records.length / itemsPerPage);

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;

    return records.slice(start, start + itemsPerPage);
  }, [records, currentPage]);
  return (
    <section className="mt-[18px] overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-[0_2px_5px_rgba(38,82,144,.1)]">
      <h2 className="border-b border-slate-200 px-4 py-3 text-[13px] font-bold text-slate-800">
        PTP Register - Tabular View
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-[12px]">
          <thead className="bg-slate-100 text-[12px] text-slate-500">
            <tr>
              {[
                "CUSTOMER",
                "INVOICE",
                "PTP AMOUNT",
                "PROMISE DATE",
                "CREATION DATE",
                "DUE DATE",
                "STATUS",
                "COLLECTION OWNER",
                "FOLLOW-UP",
              ].map((heading) => (
                <th key={heading} className="px-3 py-2 font-bold">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.map((record, index) => (
              <tr
                key={`${record.invoice}-${record.customer}-${index}`}
                className="border-t border-slate-200 hover:bg-slate-50"
              >
                {/* <td
                  className="px-3 py-3 font-bold text-[#2671e3] cursor-pointer hover:underline"
                  onClick={() => router.push("/account")}
                >
                  {record.customer}
                </td> */}
                <td className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/account?id=${encodeURIComponent(record.id)}`)
                    }
                    className="font-bold text-[#2671e3] hover:underline"
                  >
                    {record.customer}
                  </button>
                </td>
                <td className="px-3 py-3 text-slate-600">{record.invoice}</td>
                <td className="px-3 py-3 font-bold text-slate-800">
                  {record.amount}
                </td>
                <td className="px-3 py-3">{record.promiseDate}</td>
                <td className="px-3 py-3">{record.created}</td>
                <td className="px-3 py-3">{record.dueDate}</td>
                {/* <td className="px-3 py-3">
                  <span className="rounded bg-blue-100 px-2 py-1 font-semibold text-blue-600">
                    ● {record.status}
                  </span>
                </td> */}
                <td className="px-3 py-3">
                  <span
                    className={`rounded px-2 py-1 font-semibold ${
                      record.status?.toLowerCase() === "partial"
                        ? "bg-orange-100 text-orange-600"
                        : record.status?.toLowerCase() === "active"
                          ? "bg-blue-100 text-blue-600"
                          : record.status?.toLowerCase() === "broken"
                            ? "bg-red-100 text-red-600"
                            : record.status?.toLowerCase() === "fulfilled"
                              ? "bg-green-100 text-green-600"
                              : record.status?.toLowerCase() === "due soon"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    ● {record.status}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <b className="mr-1 inline-grid h-5 w-5 place-items-center rounded-full bg-[#214cad] text-[10px] font-semibold text-white">
                    {record.initials ||
                      record.owner
                        ?.split(" ")
                        ?.map((word) => word[0])
                        ?.join("")
                        ?.substring(0, 2)
                        ?.toUpperCase() ||
                      "NA"}
                  </b>
                  {record.owner}
                </td>{" "}
                <td className="px-3 py-3">{record.followUp}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3">
          <div className="text-[13px] text-slate-500">
            Showing{" "}
            {records.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, records.length)} of{" "}
            {records.length} accounts
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[13px] text-slate-500">Rows per page</span>

            <select
              value={itemsPerPage}
              disabled
              className="h-8 rounded-md border border-slate-200 px-2 text-[13px]"
            >
              <option>10</option>
            </select>

            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 disabled:opacity-40"
            >
              ‹
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                const page = index + 1;

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 rounded-md text-sm font-medium ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              {totalPages > 5 && (
                <>
                  <span className="px-1 text-slate-400">...</span>

                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`h-8 w-8 rounded-md text-sm font-medium ${
                      currentPage === totalPages
                        ? "bg-blue-600 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
