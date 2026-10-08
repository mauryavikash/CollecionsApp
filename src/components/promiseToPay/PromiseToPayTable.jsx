export default function PromiseToPayTable({ records = [] }) {
  return (
    <section className="mt-[18px] overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-[0_2px_5px_rgba(38,82,144,.1)]">
      <h2 className="border-b border-slate-200 px-4 py-3 text-[13px] font-bold text-slate-800">
        PTP Register - Tabular View
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-[9px]">
          <thead className="bg-slate-100 text-[8px] text-slate-500">
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
            {records.map((record, index) => (
              <tr
                key={`${record.invoice}-${record.customer}-${index}`}
                className="border-t border-slate-200 hover:bg-slate-50"
              >
                <td className="px-3 py-3 font-bold text-[#2671e3]">
                  {record.customer}
                </td>
                <td className="px-3 py-3 text-slate-600">{record.invoice}</td>
                <td className="px-3 py-3 font-bold text-slate-800">
                  {record.amount}
                </td>
                <td className="px-3 py-3">{record.promiseDate}</td>
                <td className="px-3 py-3">{record.created}</td>
                <td className="px-3 py-3">{record.dueDate}</td>
                <td className="px-3 py-3">
                  <span className="rounded bg-blue-100 px-2 py-1 font-semibold text-blue-600">
                    ● {record.status}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <b className="mr-1 inline-grid h-5 w-5 place-items-center rounded-full bg-[#214cad] text-[7px] font-semibold text-white">
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
      </div>
    </section>
  );
}
