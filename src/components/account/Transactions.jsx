export default function Transactions({ transactions = [] }) {
  return (
    <section className="mt-4 overflow-hidden rounded-[11px] bg-white shadow-sm">
      <div className="flex justify-between border-b border-slate-200 px-3 py-3">
        <h2 className="text-[11px] font-bold">Open Invoices & Transactions</h2>
        <button
          type="button"
          className="text-[9px] font-semibold text-blue-600"
        >
          + Add Invoice
        </button>
      </div>
      <table className="w-full min-w-[760px] text-left text-[10px]">
        <thead className="bg-slate-100 text-[8px] text-slate-500">
          <tr>
            {[
              "INVOICE #",
              "INVOICE DATE",
              "DUE DATE",
              "AMOUNT",
              "STATUS",
              "DAYS OVERDUE",
            ].map((heading) => (
              <th key={heading} className="px-3 py-2">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((item) => (
            <tr key={item.invoice} className="border-t border-slate-200">
              <td className="px-3 py-3">{item.invoice}</td>
              <td className="px-3 py-3 text-slate-500">{item.date}</td>
              <td className="px-3 py-3 text-slate-500">{item.due}</td>
              <td className="px-3 py-3 font-bold">{item.amount}</td>
              <td className="px-3 py-3">
                <span
                  className={`rounded px-2 py-1 text-[8px] font-semibold ${item.status === "Paid" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-500"}`}
                >
                  {item.status}
                </span>
              </td>
              <td
                className={`px-3 py-3 font-semibold ${item.status === "Overdue" ? "text-red-500" : "text-slate-400"}`}
              >
                {item.days}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
