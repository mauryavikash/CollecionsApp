"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  CalendarClock,
  CalendarRange,
  ChartColumn,
  CircleCheck,
  ClipboardList,
  Handshake,
  Mail,
  MessagesSquare,
  NotebookPen,
  Pencil,
  Phone,
  ShieldCheck,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { formatCompactCurrency, getAvatarColor, getInitials, parseISODate } from "@/utils/helpers";

const OVERDUE_KEYS = ["61-90", "91-180", "181+"];

function Card({ icon: Icon, title, action, children }) {
  return (
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_2px_6px_rgba(38,82,144,.08)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-slate-800">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600">
            <Icon className="h-4 w-4" />
          </span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function findInfo(information, label) {
  return information.find((item) => String(item?.label).toLowerCase() === label.toLowerCase())?.value;
}

function findMetric(account, id) {
  return (account?.metrics ?? []).find((metric) => metric?.id === id);
}

const DAY_MS = 86_400_000;

const SEVERITY_CLASSES = {
  high: "bg-red-50 text-red-600",
  critical: "bg-red-50 text-red-600",
  medium: "bg-amber-50 text-amber-600",
  low: "bg-green-50 text-green-600",
  positive: "bg-green-50 text-green-600",
};

const SEVERITY_ICON = {
  high: { Icon: TriangleAlert, className: "bg-red-50 text-red-500" },
  critical: { Icon: TriangleAlert, className: "bg-red-50 text-red-500" },
  medium: { Icon: TriangleAlert, className: "bg-amber-50 text-amber-500" },
  low: { Icon: CircleCheck, className: "bg-green-50 text-green-600" },
  positive: { Icon: CircleCheck, className: "bg-green-50 text-green-600" },
};

const ACTIVITY_ICON = {
  call: { Icon: Phone, className: "bg-green-50 text-green-600" },
  email: { Icon: Mail, className: "bg-amber-50 text-amber-600" },
  note: { Icon: NotebookPen, className: "bg-orange-50 text-orange-500" },
  ptp: { Icon: Handshake, className: "bg-violet-50 text-violet-600" },
  contact: { Icon: MessagesSquare, className: "bg-blue-50 text-blue-600" },
  "follow-up": { Icon: CalendarClock, className: "bg-sky-50 text-sky-600" },
};

// Recent Activity: backend recentActivity if present, otherwise built from PTP history
// (one row per promise) and the worklist last-contact date.
function buildRecentActivity(recentActivity, ptpHistory, lastContact, collector) {
  if (recentActivity.length) return recentActivity;
  const rows = ptpHistory.map((item) => {
    const due = item?.promiseDate ?? item?.promise;
    return {
      date: item?.created || due || "",
      type: "PTP",
      details: [item?.promiseAmount ?? item?.amount, due ? `Due ${due}` : null, item?.status].filter(Boolean).join(" - "),
      by: item?.createdBy?.name ?? item?.collector ?? "",
    };
  });
  if (lastContact) {
    rows.push({ date: lastContact, type: "Contact", details: "Last customer contact", by: collector || "" });
  }
  return rows
    .filter((row) => row.date)
    .sort((a, b) => (parseISODate(b.date)?.getTime() ?? 0) - (parseISODate(a.date)?.getTime() ?? 0));
}

// Risk Indicators: backend riskIndicators if present, otherwise derived from the
// account metrics, aging buckets, PTP counts and last contact.
function buildRiskIndicators(riskIndicators, { account, aging, lastContact, asOfDate }) {
  if (riskIndicators.length) return riskIndicators;
  const items = [];
  const dpd = Number(findMetric(account, "dpd")?.valueRaw);
  if (Number.isFinite(dpd)) {
    if (dpd >= 90) items.push({ label: "High DPD", description: `${dpd} days past due`, severity: "High" });
    else if (dpd > 30) items.push({ label: "Elevated DPD", description: `${dpd} days past due`, severity: "Medium" });
    else items.push({ label: "DPD Within Range", description: `${dpd} days past due`, severity: "Positive" });
  }

  const overdueRaw = Number(findMetric(account, "overdue")?.valueRaw);
  const oldest = aging.find((bucket) => bucket.key === "181+");
  if (oldest && Number.isFinite(overdueRaw) && overdueRaw > 0 && oldest.amountRaw > 0) {
    const share = Math.round((oldest.amountRaw / overdueRaw) * 100);
    if (share >= 25) {
      items.push({ label: "Large Balance in 181+", description: `${share}% of overdue amount`, severity: share >= 50 ? "High" : "Medium" });
    }
  }

  const broken = Number(findMetric(account, "broken-ptp")?.valueRaw);
  if (Number.isFinite(broken)) {
    items.push(
      broken === 0
        ? { label: "No Broken PTPs", description: "Good payment discipline", severity: "Positive" }
        : { label: "Broken PTPs", description: `${broken} broken promise${broken === 1 ? "" : "s"}`, severity: broken > 1 ? "High" : "Medium" },
    );
  }

  const contact = parseISODate(lastContact);
  const asOf = asOfDate ? new Date(asOfDate) : new Date();
  if (contact && !Number.isNaN(asOf.getTime())) {
    const days = Math.max(0, Math.floor((asOf.getTime() - contact.getTime()) / DAY_MS));
    items.push(
      days <= 7
        ? { label: "Recent Engagement", description: "Contact within 7 days", severity: "Positive" }
        : { label: "Low Engagement", description: `Last contact ${days} days ago`, severity: days > 30 ? "High" : "Medium" },
    );
  } else {
    items.push({ label: "No Engagement", description: "No contact on record", severity: "High" });
  }
  return items;
}

export default function Overview({
  account = {},
  information = [],
  aging = [],
  totalAr = 0,
  recentActivity = [],
  riskIndicators = [],
  ptpHistory = [],
  asOfDate,
  onViewActivity,
  onViewRisk,
}) {
  const collector = findInfo(information, "Assigned Collector") ?? account.collector;
  const lastContact = findInfo(information, "Last Contact");
  const activity = buildRecentActivity(recentActivity, ptpHistory, lastContact, collector).slice(0, 4);
  const indicators = buildRiskIndicators(riskIndicators, { account, aging, lastContact, asOfDate });
  const customerSince = findInfo(information, "Customer Since") ?? account.customerSince;
  const rows = [
    { label: "Account Name", value: account.name },
    { label: "Account #", value: account.accountNumber ?? account.id },
    { label: "Industry", value: findInfo(information, "Industry") ?? account.industry },
    { label: "Payment Terms", value: findInfo(information, "Payment Terms") ?? account.terms },
    { label: "Last Contact", value: findInfo(information, "Last Contact") },
    {
      label: "Assigned Collector",
      value: collector ? (
        <span className="inline-flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: getAvatarColor(collector) }}>
            {getInitials(collector)}
          </span>
          {collector}
        </span>
      ) : null,
    },
    {
      label: "Account Status",
      value: findInfo(information, "Account Status") ?? (totalAr > 0 ? "Active" : "Inactive"),
      badge: true,
    },
    ...(customerSince ? [{ label: "Customer Since", value: customerSince }] : []),
    ...information
      .filter(
        (item) =>
          !["payment terms", "last contact", "assigned collector", "account status", "industry", "customer since"].includes(
            String(item?.label).toLowerCase(),
          ),
      )
      .map((item) => ({ label: item.label, value: item.value })),
  ];
  const overdueBuckets = aging.filter((bucket) => OVERDUE_KEYS.includes(bucket.key));
  const chartData = aging.map((bucket) => ({ ...bucket, display: Math.max(bucket.amountRaw, 0) }));

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Card
          icon={UserRound}
          title="Account Information"
          action={
            <button
              type="button"
              disabled
              title="Editing account details is not available yet"
              className="inline-flex h-8 cursor-not-allowed items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-[12px] font-semibold text-blue-700 opacity-70"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          }
        >
          <dl>
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 border-b border-slate-100 py-1.5 text-[12px] last:border-b-0">
                <dt className="text-slate-500">{row.label}</dt>
                <dd className="text-right font-medium text-slate-800">
                  {row.badge ? (
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${row.value === "Active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                      {row.value}
                    </span>
                  ) : (
                    row.value || "-"
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Card>

        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
        <Card icon={ChartColumn} title="Open AR by Aging Bucket">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 22, right: 6, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#475569" }} tickLine={false} axisLine={false} interval={0} />
                <YAxis tickFormatter={formatCompactCurrency} tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} width={48} />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  formatter={(_, __, item) => [`${item.payload.amount} (${item.payload.percent}%)`, "Open AR"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 11 }}
                />
                <Bar dataKey="display" radius={[4, 4, 0, 0]} maxBarSize={44}>
                  {chartData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                  <LabelList dataKey="amount" position="top" style={{ fontSize: 11, fontWeight: 700, fill: "#0f172a" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card icon={CalendarRange} title="Invoice Aging Distribution">
          <div className="grid grid-cols-5 gap-1 text-center">
            {aging.map((bucket) => (
              <span key={bucket.key} className="text-[11px] font-semibold text-slate-600">
                {bucket.percent}%
              </span>
            ))}
            {aging.map((bucket) => (
              <span key={bucket.key} className="h-5 rounded-sm" style={{ backgroundColor: bucket.color }} title={`${bucket.short}: ${bucket.amount}`} />
            ))}
            {aging.map((bucket) => (
              <span key={bucket.key} className="text-[11px] text-slate-500">
                {bucket.short}
              </span>
            ))}
          </div>

          <p className="mt-5 text-[14px] font-medium text-slate-700">Overdue by age</p>
          <ul className="mt-2 space-y-2.5">
            {overdueBuckets.map((bucket) => (
              <li key={bucket.key} className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2 text-slate-600">
                  <i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: bucket.color }} />
                  {bucket.short.replace("-", "–")}
                </span>
                <b style={{ color: bucket.color }}>{bucket.amount}</b>
              </li>
            ))}
          </ul>
        </Card>

        <Card
          icon={ClipboardList}
          title="Recent Activity"
          action={
            onViewActivity && (
              <button type="button" onClick={onViewActivity} className="text-[12px] font-semibold text-blue-600 hover:underline">
                View All
              </button>
            )
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-[12px]">
              <thead className="bg-slate-50 text-[11px] text-slate-500">
                <tr>
                  {["Date", "Type", "Details", "By"].map((heading) => (
                    <th key={heading} className="px-2 py-1.5 font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activity.length ? (
                  activity.map((item, index) => {
                    const icon = ACTIVITY_ICON[String(item.type).toLowerCase()] ?? ACTIVITY_ICON.contact;
                    const TypeIcon = icon.Icon;
                    return (
                      <tr key={`${item.date}-${index}`} className="border-t border-slate-100">
                        <td className="whitespace-nowrap px-2 py-2 text-slate-500">{item.date}</td>
                        <td className="px-2 py-2">
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                            <span className={`grid h-5 w-5 place-items-center rounded ${icon.className}`}>
                              <TypeIcon className="h-3 w-3" />
                            </span>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-slate-600">{item.details}</td>
                        <td className="whitespace-nowrap px-2 py-2 text-slate-500">{item.by || "-"}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-2 py-8 text-center text-slate-500">
                      No recent activity available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card
          icon={ShieldCheck}
          title="Risk Indicators"
          action={
            onViewRisk && (
              <button type="button" onClick={onViewRisk} className="text-[12px] font-semibold text-blue-600 hover:underline">
                View Details
              </button>
            )
          }
        >
          {indicators.length ? (
            <ul className="space-y-2">
              {indicators.map((indicator, index) => {
                const severity = String(indicator.severity ?? "").toLowerCase();
                const icon = SEVERITY_ICON[severity] ?? SEVERITY_ICON.medium;
                const SeverityIcon = icon.Icon;
                return (
                  <li key={`${indicator.label}-${index}`} className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${icon.className}`}>
                        <SeverityIcon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-semibold text-slate-800">{indicator.label}</p>
                        <p className="truncate text-[11px] text-slate-500">{indicator.description}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-0.5 text-[11px] font-semibold ${SEVERITY_CLASSES[severity] ?? SEVERITY_CLASSES.medium}`}>
                      {indicator.severity}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-8 text-center text-[12px] text-slate-500">No risk indicators available.</p>
          )}
        </Card>
        </div>
    </div>
  );
}
