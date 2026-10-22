"use client";

import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Check,
  ChevronRight,
  CircleDashed,
  FileText,
  MessageSquareText,
  UserRound,
  X,
} from "lucide-react";
import Pagination from "@/components/common/Pagination";
import { formatShortDate } from "@/utils/helpers";
import { getIndustry } from "@/utils/industry";

export const PTP_STATUS_STYLES = {
  fulfilled: { pill: "bg-green-50 text-green-700", border: "#22c55e" },
  active: { pill: "bg-blue-50 text-blue-700", border: "#3b82f6" },
  partial: { pill: "bg-violet-50 text-violet-700", border: "#8b5cf6" },
  broken: { pill: "bg-red-50 text-red-600", border: "#ef4444" },
  dueSoon: { pill: "bg-orange-50 text-orange-600", border: "#f97316" },
};

export function getPtpStatusStyle(record) {
  if (record.isDueSoon) return PTP_STATUS_STYLES.dueSoon;
  return PTP_STATUS_STYLES[record.statusKey] ?? { pill: "bg-slate-100 text-slate-600", border: "#94a3b8" };
}

function getSteps(statusKey) {
  const paid = statusKey === "fulfilled" ? "done" : statusKey === "partial" ? "partial" : "pending";
  return [
    { label: "Created", state: "done" },
    { label: "Promised", state: statusKey === "broken" ? "failed" : "done", current: statusKey !== "fulfilled" && statusKey !== "broken" },
    { label: statusKey === "partial" ? "Partially Paid" : "Paid", state: paid },
  ];
}

const STEP_STYLES = {
  done: { circle: "bg-green-500 text-white", Icon: Check, line: "bg-green-500" },
  failed: { circle: "bg-red-500 text-white", Icon: X, line: "bg-red-300" },
  partial: { circle: "bg-violet-500 text-white", Icon: CircleDashed, line: "bg-violet-300" },
  pending: { circle: "border-2 border-slate-300 bg-white text-transparent", Icon: Check, line: "bg-slate-200" },
};

function Timeline({ statusKey }) {
  const steps = getSteps(statusKey);
  return (
    <ol className="mt-4 flex items-start">
      {steps.map((step, index) => {
        const style = STEP_STYLES[step.state];
        const next = steps[index + 1];
        return (
          <li key={step.label} className="relative flex flex-1 flex-col items-center">
            {next && (
              <span className={`absolute left-1/2 top-[10px] h-[2px] w-full ${STEP_STYLES[next.state].line}`} aria-hidden="true" />
            )}
            <span className={`relative z-10 grid h-[22px] w-[22px] place-items-center rounded-full ${style.circle}`}>
              <style.Icon className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            <span className={`mt-1 text-[11px] ${step.current ? "font-semibold text-green-600" : "text-slate-500"}`}>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function InfoBox({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
      <Icon className="h-4 w-4 shrink-0 text-blue-600" />
      <div className="min-w-0">
        <p className="text-[10px] text-slate-500">{label}</p>
        <p className="truncate text-[12px] font-semibold text-slate-800">{value || "-"}</p>
      </div>
    </div>
  );
}

function DateBlock({ label, value, tone }) {
  const toneClass = tone === "red" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-600";
  const valueClass = tone === "red" ? "text-red-500" : "text-blue-700";
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1 text-[10px] text-slate-500">
        <CalendarDays className="h-3 w-3" /> {label}
      </p>
      <p className="mt-1 flex items-center gap-1.5">
        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md ${toneClass}`}>
          <CalendarDays className="h-3.5 w-3.5" />
        </span>
        <span className={`truncate text-[13px] font-bold ${valueClass}`}>{formatShortDate(value)}</span>
      </p>
    </div>
  );
}

export default function PromiseToPayCard({ records = [], page, pageSize, onPageChange }) {
  const router = useRouter();
  const total = records.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const visible = records.slice(start, start + pageSize);
  const openAccount = (record) => router.push(`/account?id=${encodeURIComponent(record.id)}`);

  return (
    <>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((record) => {
          const statusStyle = getPtpStatusStyle(record);
          const industry = getIndustry(record.customer);
          const IndustryIcon = industry.Icon;
          return (
            <article
              key={record.key}
              className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_6px_rgba(38,82,144,.08)] transition-shadow hover:shadow-md"
              style={{ borderTop: `3px solid ${statusStyle.border}` }}
            >
              <div className="flex-1 px-4 pb-3 pt-3.5">
                <header className="flex items-start gap-3">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${industry.tile}`}>
                    <IndustryIcon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => openAccount(record)}
                      className="block max-w-full truncate text-left text-[14px] font-bold text-slate-900 hover:text-blue-600"
                      title={record.customer}
                    >
                      {record.customer}
                    </button>
                    <p className="text-[11px] text-slate-500">{record.invoice}</p>
                  </div>
                  <span className={`shrink-0 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-semibold ${statusStyle.pill}`}>
                    ● {record.isDueSoon ? "Due Soon" : record.status}
                  </span>
                </header>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-[10px] text-slate-500">Promise Amount</p>
                    <p className="mt-0.5 text-[22px] font-bold leading-7 text-slate-900">{record.amount}</p>
                  </div>
                  <DateBlock label="Promise Date" value={record.promiseDate} tone="blue" />
                  <DateBlock label="Due Date" value={record.dueDate} tone="red" />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <InfoBox icon={CalendarDays} label="Created" value={formatShortDate(record.created)} />
                  <InfoBox icon={UserRound} label="Collector" value={record.owner} />
                  <InfoBox icon={FileText} label="Aging Bucket" value={record.agingBucket} />
                </div>

                <Timeline statusKey={record.statusKey} />
              </div>

              <footer className="flex items-center gap-2.5 border-t border-slate-100 px-4 py-2.5">
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white"
                  style={{ backgroundColor: record.avatarColor }}
                >
                  {record.initials}
                </span>
                <div className="min-w-0 shrink-0">
                  <p className="truncate text-[12px] font-semibold text-slate-800">{record.owner}</p>
                  <p className="text-[10px] text-slate-500">Assigned Collector</p>
                </div>
                <p className="flex min-w-0 flex-1 items-center gap-1.5 text-[11px] italic text-slate-600" title={record.note}>
                  {record.note && <MessageSquareText className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                  <span className="truncate">{record.note}</span>
                </p>
                <button
                  type="button"
                  aria-label={`Open ${record.customer}`}
                  onClick={() => openAccount(record)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </footer>
            </article>
          );
        })}
      </section>

      {!total && (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white py-10 text-center text-[13px] text-slate-500">
          No promise-to-pay records match the selected filters.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[12px] text-slate-500">
        <span>
          Showing {total ? start + 1 : 0}–{Math.min(start + pageSize, total)} of {total.toLocaleString("en-US")} customers
        </span>
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </>
  );
}
