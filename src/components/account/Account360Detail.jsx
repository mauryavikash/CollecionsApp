"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  ChevronDown,
  CircleCheck,
  Clock3,
  Coins,
  Copy,
  Download,
  FileText,
  Info,
  Mail,
  NotebookPen,
  Phone,
  Star,
  TriangleAlert,
  UserRound,
  Handshake,
} from "lucide-react";
import { MiniBars, Sparkline } from "@/components/common/MiniCharts";
import { getMetric, monthlyCounts } from "./accountData";

function riskBadgeClass(risk = "") {
  const value = risk.toLowerCase();
  if (value.includes("critical")) return "border-red-200 bg-red-50 text-red-700";
  if (value.includes("high")) return "border-orange-200 bg-orange-50 text-orange-700";
  if (value.includes("medium")) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-green-200 bg-green-50 text-green-700";
}

function ptpBadgeClass(ptp = "") {
  const value = ptp.toLowerCase();
  if (value.includes("broken")) return "border-red-200 bg-red-50 text-red-600";
  if (value.includes("partial")) return "border-violet-200 bg-violet-50 text-violet-600";
  if (value.includes("active") || value.includes("open")) return "border-blue-200 bg-blue-50 text-blue-600";
  if (value.includes("fulfilled")) return "border-green-200 bg-green-50 text-green-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function useOutsideClose(open, setOpen) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, setOpen]);
  return ref;
}

const SENTIMENT_CLASS = {
  positive: "text-green-600",
  negative: "text-red-600",
  neutral: "text-slate-500",
};

function ChangeLine({ change }) {
  if (!change) return null;
  const Arrow = change.direction === "up" ? ArrowUp : change.direction === "down" ? ArrowDown : ArrowRight;
  return (
    <p className={`flex flex-wrap items-center gap-x-1 text-[11px] ${SENTIMENT_CLASS[change.sentiment] ?? SENTIMENT_CLASS.neutral}`}>
      <Arrow className="h-3 w-3 shrink-0" strokeWidth={2.5} />
      <b className="font-semibold">{change.text}</b>
      {change.label && <span className="text-slate-500">{change.label}</span>}
    </p>
  );
}

function MetricCard({ metric }) {
  const Icon = metric.Icon;
  return (
    <article className={`flex min-h-[96px] flex-col justify-between rounded-xl border px-3 py-2.5 ${metric.card}`}>
      <div className="flex items-center gap-2">
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${metric.tile}`}>
          <Icon className="h-4 w-4" />
        </span>
        <p className="flex items-center gap-1 text-[12px] font-medium text-slate-700">
          {metric.label}
          <span title={metric.tooltip}>
            <Info className="h-3 w-3 text-slate-400" />
          </span>
        </p>
      </div>
      <div className="mt-1 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[22px] font-bold leading-7 text-slate-900">{metric.value}</p>
          {metric.change ? (
            <ChangeLine change={metric.change} />
          ) : (
            metric.supporting && (
              <p className={`truncate text-[11px] ${metric.supportingClass ?? "text-slate-500"}`}>{metric.supporting}</p>
            )
          )}
        </div>
        <div className="shrink-0">
          {metric.chart === "bars" ? (
            <MiniBars values={metric.series} color={metric.color} />
          ) : (
            <Sparkline values={metric.series} color={metric.color} width={60} height={30} />
          )}
        </div>
      </div>
    </article>
  );
}

// Backend metric (account.metrics[]) by id, falling back to a label keyword match.
function findMetric(account, id, keyword) {
  return (account?.metrics ?? []).find((metric) => metric?.id === id) ?? getMetric(account, keyword);
}

// "+12.4%" -> "12.4%", "-8 days" -> "8 days"; the arrow shows the direction.
function buildChange(metric) {
  if (!metric || metric.changePct == null || metric.changePct === "") return null;
  const raw = String(metric.changePct).trim();
  const numeric = Number.parseFloat(raw);
  const direction =
    metric.changeDirection ?? (Number.isFinite(numeric) ? (numeric > 0 ? "up" : numeric < 0 ? "down" : "neutral") : "neutral");
  return {
    text: raw.replace(/^[+-]/, ""),
    direction,
    sentiment: metric.changeSentiment ?? "neutral",
    label: metric.changeLabel ?? "vs last month",
  };
}

function seriesOrFallback(metric, fallback) {
  const values = Array.isArray(metric?.values) ? metric.values.map(Number).filter(Number.isFinite) : [];
  return values.length ? values : fallback;
}

function buildMetrics(account, aging, transactions, ptpHistory, ptpTotal) {
  const overdueInvoices = transactions.filter((item) => item.status === "Overdue");
  const overdueMetric = findMetric(account, "overdue", "overdue");
  const arMetric = findMetric(account, "total-ar", "total ar");
  const dpdMetric = findMetric(account, "dpd", "days");
  const agingMetric = findMetric(account, "aging", "aging");
  const brokenMetric = findMetric(account, "broken-ptp", "broken");
  const fulfilledMetric = findMetric(account, "fulfilled-ptp", "fulfilled");
  const oldestBucket = [...aging].reverse().find((bucket) => bucket.percent > 0);
  const brokenCount = ptpHistory.filter((item) => String(item?.status).toLowerCase() === "broken").length;
  const fulfilledCount = ptpHistory.filter((item) => String(item?.status).toLowerCase() === "fulfilled").length;
  const agingAmounts = aging.map((bucket) => bucket.amountRaw);
  const agingPercents = aging.map((bucket) => bucket.percent);
  const promiseCount = ptpTotal ?? ptpHistory.length;

  return [
    {
      label: "Overdue Amount",
      value: overdueMetric?.value ?? "-",
      change: buildChange(overdueMetric),
      supporting: `${overdueInvoices.length} overdue invoice${overdueInvoices.length === 1 ? "" : "s"}`,
      tooltip: "Total past-due balance across open invoices",
      Icon: Coins,
      tile: "bg-red-500 text-white",
      card: "border-red-100 bg-red-50/60",
      color: "#ef4444",
      series: agingAmounts,
    },
    {
      label: "Total AR",
      value: arMetric?.value ?? "-",
      change: buildChange(arMetric),
      supporting: `${transactions.length} recent transactions`,
      tooltip: "Total open accounts receivable",
      Icon: FileText,
      tile: "bg-blue-500 text-white",
      card: "border-blue-100 bg-blue-50/60",
      color: "#3b82f6",
      chart: "bars",
      series: seriesOrFallback(arMetric, agingAmounts),
    },
    {
      label: "Days Past Due",
      value: dpdMetric?.value ?? "-",
      change: buildChange(dpdMetric),
      supporting: "Oldest open invoice",
      tooltip: "Days past due of the oldest open invoice",
      Icon: CalendarDays,
      tile: "bg-violet-500 text-white",
      card: "border-violet-100 bg-violet-50/60",
      color: "#8b5cf6",
      series: overdueInvoices.map((item) => item.ageDays).sort((a, b) => a - b),
    },
    {
      label: "Aging Bucket",
      value: agingMetric?.value ?? "-",
      supporting: agingMetric?.context ?? (oldestBucket ? `${oldestBucket.percent}% of AR in ${oldestBucket.short}` : ""),
      supportingClass: "font-semibold text-orange-600",
      tooltip: "Aging bucket of the oldest open invoice",
      Icon: Clock3,
      tile: "bg-orange-500 text-white",
      card: "border-orange-100 bg-orange-50/60",
      color: "#f97316",
      chart: "bars",
      series: seriesOrFallback(agingMetric, agingPercents),
    },
    {
      label: "Broken PTPs",
      value: brokenMetric?.value ?? String(brokenCount),
      change: buildChange(brokenMetric),
      supporting: `of ${promiseCount} promises`,
      tooltip: "Promises to pay that were not honored",
      Icon: TriangleAlert,
      tile: "bg-red-500 text-white",
      card: "border-red-100 bg-red-50/40",
      color: "#ef4444",
      chart: "bars",
      series: seriesOrFallback(brokenMetric, monthlyCounts(ptpHistory, "broken")),
    },
    {
      label: "Fulfilled PTPs",
      value: fulfilledMetric?.value ?? String(fulfilledCount),
      change: buildChange(fulfilledMetric),
      supporting: `of ${promiseCount} promises`,
      tooltip: "Promises to pay honored in full",
      Icon: CircleCheck,
      tile: "bg-green-500 text-white",
      card: "border-green-100 bg-green-50/60",
      color: "#16a34a",
      chart: "bars",
      series: seriesOrFallback(fulfilledMetric, monthlyCounts(ptpHistory, "fulfilled")),
    },
  ];
}

export default function Account360Detail({ account = {}, industry, aging = [], transactions = [], ptpHistory = [], ptpTotal, onAction }) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const favoriteKey = `account-favorite-${account.id}`;
  const [favorite, setFavorite] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(favoriteKey) === "true",
  );
  const actionsRef = useOutsideClose(actionsOpen, setActionsOpen);
  const contactRef = useOutsideClose(contactOpen, setContactOpen);

  const toggleFavorite = () => {
    const next = !favorite;
    setFavorite(next);
    localStorage.setItem(favoriteKey, String(next));
  };

  const metrics = buildMetrics(account, aging, transactions, ptpHistory, ptpTotal);
  const actions = [
    { id: "transactions", label: "View transactions", Icon: FileText },
    { id: "ptp", label: "View PTP history", Icon: Handshake },
    { id: "notes", label: "Open notes", Icon: NotebookPen },
    { id: "export", label: "Export transactions", Icon: Download },
    { id: "copy", label: "Copy account #", Icon: Copy },
  ];
  const contactRows = [
    { Icon: UserRound, value: account.contact, href: null },
    { Icon: Phone, value: account.phone, href: account.phone ? `tel:${account.phone}` : null },
    { Icon: Mail, value: account.email, href: account.email ? `mailto:${account.email}` : null },
  ].filter((row) => row.value);

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-[0_2px_6px_rgba(38,82,144,.08)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-blue-600 text-[20px] font-bold text-white">
            {account.initials}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[22px] font-bold text-slate-900">{account.name}</h1>
              <button
                type="button"
                onClick={toggleFavorite}
                aria-pressed={favorite}
                aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
                className="text-slate-400 hover:text-amber-500"
              >
                <Star className={`h-5 w-5 ${favorite ? "fill-amber-400 text-amber-500" : ""}`} />
              </button>
              {account.risk && (
                <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${riskBadgeClass(account.riskSegment ?? account.risk)}`}>
                  {account.risk}
                </span>
              )}
              {account.ptp && (
                <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${ptpBadgeClass(account.ptpStatus ?? account.ptp)}`}>
                  {account.ptp}
                </span>
              )}
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[12px] text-slate-600">
              <span>Acct #{account.accountNumber ?? account.id}</span>
              {industry && (
                <>
                  <span className="h-3 border-l border-slate-300" />
                  <span>Industry: {industry}</span>
                </>
              )}
              <span className="h-3 border-l border-slate-300" />
              <span>Terms: {account.terms || "-"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={actionsRef}>
            <button
              type="button"
              onClick={() => setActionsOpen((open) => !open)}
              aria-expanded={actionsOpen}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-semibold text-blue-700 hover:bg-slate-50"
            >
              Actions <ChevronDown className="h-4 w-4" />
            </button>
            {actionsOpen && (
              <ul className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                {actions.map(({ id, label, Icon }) => (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => {
                        setActionsOpen(false);
                        onAction?.(id);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-slate-700 hover:bg-slate-50"
                    >
                      <Icon className="h-4 w-4 text-slate-500" /> {label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="relative" ref={contactRef}>
            <button
              type="button"
              onClick={() => setContactOpen((open) => !open)}
              aria-expanded={contactOpen}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-[13px] font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Mail className="h-4 w-4" /> Contact
            </button>
            {contactOpen && (
              <div className="absolute right-0 z-20 mt-1 w-64 rounded-lg border border-slate-200 bg-white p-3 text-[12px] shadow-lg">
                {contactRows.length ? (
                  <ul className="space-y-2">
                    {contactRows.map(({ Icon, value, href }) => (
                      <li key={value} className="flex items-center gap-2 text-slate-700">
                        <Icon className="h-4 w-4 text-slate-400" />
                        {href ? (
                          <a href={href} className="text-blue-600 hover:underline">
                            {value}
                          </a>
                        ) : (
                          value
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">No contact details are on file for this account.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>
    </section>
  );
}
