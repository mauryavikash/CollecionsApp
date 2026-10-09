export default function PromiseToPayCard({
  filters = [],
  activeFilter,
  onFilterChange,
  records = [],
}) {
  return (
    <>
      <section className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => onFilterChange(filter.label)}
              className={`rounded-full border px-3 py-1 text-[9px] font-semibold ${activeFilter === filter.label ? "border-[#2463e4] bg-[#2463e4] text-white" : "border-slate-200 bg-white text-slate-500"}`}
            >
              {filter.label} <span className="ml-1">{filter.count}</span>
            </button>
          ))}
        </div>
        {/* <button type="button" className="inline-flex h-[25px] items-center gap-1 rounded bg-[#2463e4] px-2.5 text-[9px] font-semibold text-white"><Plus className="h-3 w-3" />Add New PTP</button> */}
      </section>
      <section className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {records.map((record, index) => (
          <article
            key={`${record.invoice}-${record.customer}-${index}`}
            className="min-h-[224px] rounded-[10px] bg-white px-4 py-3 shadow-[0_2px_5px_rgba(38,82,144,.1)]"
          >
            <div className="flex justify-between gap-2">
              <div>
                <h2 className="text-[13px] font-bold text-slate-800">
                  {record.customer}
                </h2>
                <p className="text-[9px] text-slate-400">{record.invoice}</p>
              </div>
              {/* <span className="rounded bg-blue-100 px-2 py-1 text-[8px] font-semibold text-blue-600">
                ● {record.status}
              </span> */}
              <span
                className={`inline-flex h-6 w-[70px] items-center justify-center rounded px-2 py-1 text-[8px] font-semibold ${
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
            <p className="mt-4 text-[8px] font-semibold text-slate-400">
              PROMISE AMOUNT
            </p>
            <p className="text-[23px] font-bold leading-6 text-slate-800">
              {record.amount}
            </p>
            <div className="mt-3 grid grid-cols-3 rounded-md bg-slate-100 px-2 py-2 text-[8px]">
              <p>
                <b className="block text-[7px] text-slate-400">CREATED</b>
                {record.created}
              </p>
              <p>
                <b className="block text-[7px] text-slate-400">PROMISE DATE</b>
                {record.promiseDate}
              </p>
              <p>
                <b className="block text-[7px] text-slate-400">DUE DATE</b>
                {record.dueDate}
              </p>
            </div>
            <p className="mt-3 text-[10px]">
              <b className="mr-1 inline-grid h-5 w-5 place-items-center rounded-full bg-[#214cad] text-[7px] text-white">
                {record.initials || "NA"}
              </b>

              {record.owner}
            </p>
            <p className="mt-3 border-t border-slate-200 pt-2 text-[8px] italic text-slate-500">
              {record.note}
            </p>
          </article>
        ))}
      </section>
    </>
  );
}
