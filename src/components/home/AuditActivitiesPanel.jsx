import { ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AuditActivitiesPanel({ data }) {
  const staticAuditActivities = [
    {
      time: "May 20, 2025 10:24 AM",
      activity: "Case Status Updated",
      user: "Sarah Johnson",
      source: "UI",
      badge: "bg-blue-100 text-blue-700",
    },
    {
      time: "May 20, 2025 10:18 AM",
      activity: "AI Recommendation Accepted",
      user: "Michael Brown",
      source: "UI",
      badge: "bg-blue-100 text-blue-700",
    },
    {
      time: "May 20, 2025 10:11 AM",
      activity: "Recovery Initiated",
      user: "Priya Nair",
      source: "UI",
      badge: "bg-blue-100 text-blue-700",
    },
    {
      time: "May 20, 2025 10:05 AM",
      activity: "Data Ingestion Completed",
      user: "System",
      source: "Integration",
      badge: "bg-purple-100 text-purple-700",
    },
    {
      time: "May 20, 2025 09:58 AM",
      activity: "Escalation Triggered",
      user: "David Lee",
      source: "System",
      badge: "bg-indigo-100 text-indigo-700",
    },
  ];

  const apiActivities = Array.isArray(data) ? data : data?.items;
  const auditActivities = Array.isArray(apiActivities) && apiActivities.length
    ? apiActivities.map((activity) => ({
        time: activity.time ?? (activity.timestamp ? new Date(activity.timestamp).toLocaleString() : "-"),
        badge: activity.source === "Integration"
          ? "bg-purple-100 text-purple-700"
          : activity.source === "System"
            ? "bg-indigo-100 text-indigo-700"
            : "bg-blue-100 text-blue-700",
        ...activity,
      }))
    : staticAuditActivities;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-4 flex justify-between">
        <h2 className="text-sm font-semibold text-slate-900">
          Recent Audit Activities
        </h2>

        <button className="cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-700">
          View all activity
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 border-b border-slate-200 pb-2 text-[11px] font-medium text-slate-400">
        <div>Time</div>
        <div>Activity</div>
        <div>User</div>
        <div>Source</div>
      </div>

      {auditActivities.map((item, index) => (
        <div
          key={index}
          className="grid cursor-pointer grid-cols-4 gap-2 border-b border-slate-100 py-2 text-xs"
        >
          <div className="text-slate-500">
            {item.time}
          </div>

          <div className="truncate font-medium text-slate-700">
            {item.activity}
          </div>

          <div className="text-slate-500">
            {item.user}
          </div>

          <div>
            <span
              className={`cursor-pointer rounded px-2 py-1 text-[10px] font-medium ${item.badge}`}
            >
              {item.source}
            </span>
          </div>
        </div>
      ))}

      <Link href="/audit" className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 text-xs font-medium text-slate-600">
        <ExternalLink size={14} />
        Go to Audit Trail
      </Link>
    </div>
  );
}
