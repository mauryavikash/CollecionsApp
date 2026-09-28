import {
  FileText,
  AlertCircle,
  FolderOpen,
  TrendingUp,
  Clock3,
  Users,
  ChevronRight,
  Calendar,
} from "lucide-react";

export default function OperationalReporting({ data }) {
  const recentPTPActivity = [
  {
    customer: "Dynamic Solutions Corp",
    amount: "$180K",
    promiseDate: "2024-10-23",
    status: "Paid",
    owner: "Mark Davis",
  },
  {
    customer: "Vertex Technologies",
    amount: "$324K",
    promiseDate: "2024-10-05",
    status: "Active",
    owner: "James Wilson",
  },
  {
    customer: "Acme Manufacturing Ltd",
    amount: "$180K",
    promiseDate: "2024-10-15",
    status: "Active",
    owner: "Sarah Chen",
  },
  {
    customer: "Pinnacle Healthcare",
    amount: "$260K",
    promiseDate: "2024-09-30",
    status: "Pending",
    owner: "Emma Rodriguez",
  },
  {
    customer: "Coastal Distribution",
    amount: "$200K",
    promiseDate: "2024-09-21",
    status: "Overdue",
    owner: "Emma Rodriguez",
  },
];
  return (
    <div className="col-span-12 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
  <div className="mb-4 flex items-center justify-between">
    <h2 className="text-lg font-bold uppercase text-slate-800">
      RECENT PROMISE-TO-PAY (PTP) ACTIVITY
    </h2>

    <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
      Manage PTPs →
    </button>
  </div>

  <div className="overflow-hidden rounded-xl border border-slate-200">
    <table className="w-full">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50">
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
            Customer
          </th>

          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
            PTP Amount
          </th>

          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
            Promise Date
          </th>

          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
            Status
          </th>

          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
            Owner
          </th>
        </tr>
      </thead>

      <tbody>
        {recentPTPActivity.map((item, index) => (
          <tr
            key={index}
            className="border-b border-slate-100 hover:bg-slate-50"
          >
            <td className="px-4 py-4 text-sm font-semibold text-slate-800">
              {item.customer}
            </td>

            <td className="px-4 py-4 text-sm font-semibold text-slate-800">
              {item.amount}
            </td>

            <td className="px-4 py-4 text-sm text-slate-500">
              {item.promiseDate}
            </td>

            <td className="px-4 py-4">
              <span
                className={`inline-flex rounded-md px-3 py-1 text-xs font-semibold ${
                  item.status === "Paid"
                    ? "bg-green-100 text-green-700"
                    : item.status === "Active"
                    ? "bg-blue-100 text-blue-700"
                    : item.status === "Pending"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {item.status}
              </span>
            </td>

            <td className="px-4 py-4 text-sm text-slate-700">
              {item.owner}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
  );
}
