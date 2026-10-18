import { useRouter } from "next/navigation";

export default function PromiseToPayCard({
  filters = [],
  activeFilter,
  onFilterChange,
  records = [],
}) {
  const router = useRouter();

  return (
    <>
      <section className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => onFilterChange(filter.label)}
              className={`rounded-full border px-3 py-1 text-[12px] font-semibold ${activeFilter === filter.label ? "border-[#2463e4] bg-[#2463e4] text-white" : "border-slate-200 bg-white text-slate-500"}`}
            >
              {filter.label} <span className="ml-1">{filter.count}</span>
            </button>
          ))}
        </div>
        {/* <button type="button" className="inline-flex h-[25px] items-center gap-1 rounded bg-[#2463e4] px-2.5 text-[9px] font-semibold text-white"><Plus className="h-3 w-3" />Add New PTP</button> */}
      </section>
      <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {records.map((record, index) => (
          <article
            key={`${record.invoice}-${record.customer}-${index}`}
            className={`rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md ${
              record.status?.toLowerCase() === "fulfilled"
                ? "border-t-4 border-t-green-500"
                : record.status?.toLowerCase() === "broken"
                  ? "border-t-4 border-t-red-500"
                  : record.status?.toLowerCase() === "active"
                    ? "border-t-4 border-t-blue-500"
                    : record.status?.toLowerCase() === "partial"
                      ? "border-t-4 border-t-orange-500"
                      : "border-t-4 border-t-slate-300"
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2
                  onClick={() => {
                    router.push(`/account?id=${record.id}`);
                  }}
                  className="cursor-pointer truncate text-[16px] font-bold text-slate-800 hover:text-blue-600"
                >
                  {record.customer}
                </h2>

                <p className="mt-1 text-[12px] text-slate-500">
                  {record.invoice}
                </p>
              </div>

              <span
                className={`rounded-md px-3 py-1 text-[12px] font-semibold ${
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
            </div>

            {/* Amount */}
            <div className="mt-5">
              <p className="text-[12px] font-semibold uppercase text-slate-400">
                Promise Amount
              </p>

              <h3 className="mt-1 text-[32px] font-bold text-slate-900">
                {record.amount}
              </h3>
            </div>

            {/* Dates */}
            <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3">
              <div>
                <p className="text-[12px] font-medium text-slate-400">
                  Created
                </p>

                <p className="mt-1 text-[12px] font-semibold text-slate-700">
                  {record.created}
                </p>
              </div>

              <div>
                <p className="text-[12px] font-medium text-slate-400">
                  Promise Date
                </p>

                <p className="mt-1 text-[12px] font-semibold text-slate-700">
                  {record.promiseDate}
                </p>
              </div>

              <div>
                <p className="text-[12px] font-medium text-slate-400">
                  Due Date
                </p>

                <p className="mt-1 text-[12px] font-semibold text-slate-700">
                  {record.dueDate}
                </p>
              </div>
            </div>

            {/* Owner */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#214cad] text-[12px] font-semibold text-white">
                {record.initials ||
                  record.owner
                    ?.split(" ")
                    ?.map((word) => word[0])
                    ?.join("")
                    ?.substring(0, 2)
                    ?.toUpperCase() ||
                  "NA"}
              </div>

              <span className="text-[12px] font-medium text-slate-700">
                {record.owner}
              </span>
            </div>

            {/* Note */}
            <div className="mt-4 border-t border-slate-200 pt-3">
              <p className="text-[12px] italic text-slate-500">{record.note}</p>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
