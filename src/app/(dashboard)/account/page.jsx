"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import Account360Detail from "@/components/account/Account360Detail";
import Overview from "@/components/account/Overview";
import Transactions, { exportTransactions } from "@/components/account/Transactions";
import PTPhistory from "@/components/account/PTPhistory";
import { buildAging, getMetric, normalizeTransactions } from "@/components/account/accountData";
import { LoadingState } from "@/components/common/LoadingState";
import { getAccount } from "@/app/lib/api";
import { parseCurrency } from "@/utils/helpers";
import { getIndustry } from "@/utils/industry";

const TABS = ["Overview", "Transactions", "PTP History", "Communications", "Notes", "Documents", "Risk & Insights"];
const TAB_ALIASES = { transactions: "Transactions", ptp: "PTP History", notes: "Notes", communications: "Communications" };

const PLACEHOLDERS = {
  Communications: "Communication history and outreach records will appear here.",
  Notes: "Account notes and collector comments will appear here.",
  Documents: "Attached documents, invoices, and correspondence will appear here.",
  "Risk & Insights": "AI-powered risk analysis and collection insights will appear here.",
};

function formatUpdated(date) {
  if (!date) return "";
  const day = date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${day}, ${time}`;
}

function Account360Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("id") || "32342";
  const [data, setData] = useState(null);
  const [loadedId, setLoadedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [tab, setTab] = useState(() => TAB_ALIASES[searchParams.get("tab")] ?? "Overview");
  const loading = loadedId !== customerId;

  const load = useCallback(
    () =>
      getAccount(customerId)
        .then((response) => {
          const payload = response?.data ?? response;
          setError(null);
          setData(payload?.account360 ?? payload ?? null);
          setUpdatedAt(new Date());
        })
        .catch((err) => {
          console.error("Account 360 API Error:", err);
          setError(err);
          setData(null);
        })
        .finally(() => {
          setLoadedId(customerId);
          setRefreshing(false);
        }),
    [customerId],
  );

  useEffect(() => {
    load();
  }, [load]);

  const account = data?.account ?? {};
  const information = data?.information ?? [];
  const ptpHistory = data?.ptpHistory ?? [];
  const ptpMeta = data?.ptpHistoryMeta ?? {};
  const ptpTotal = ptpMeta.total ?? ptpHistory.length;
  const arMetric = (account.metrics ?? []).find((metric) => metric?.id === "total-ar") ?? getMetric(account, "total ar");
  const totalAr = Number.isFinite(Number(arMetric?.valueRaw)) ? Number(arMetric.valueRaw) : parseCurrency(arMetric?.value);
  const aging = useMemo(() => buildAging(data?.aging ?? [], totalAr), [data, totalAr]);
  const transactions = useMemo(() => normalizeTransactions(data?.transactions ?? []), [data]);
  const industry = account.industry || getIndustry(account.name).label;
  const breadcrumb = Array.isArray(data?.breadcrumb) && data.breadcrumb.length === 3 ? data.breadcrumb : ["Collector Workbench", account.name, "Account 360"];
  const lastUpdated = data?.lastUpdated ?? formatUpdated(updatedAt);

  const handleAction = async (action) => {
    if (action === "transactions") setTab("Transactions");
    if (action === "ptp") setTab("PTP History");
    if (action === "notes") setTab("Notes");
    if (action === "export") exportTransactions(transactions, `account-${account.id}-transactions`, "xlsx");
    if (action === "copy") {
      try {
        await navigator.clipboard.writeText(String(account.id));
        toast.success(`Copied account #${account.id}`);
      } catch {
        toast.error("Unable to copy to clipboard");
      }
    }
  };

  if (loading) {
    return <LoadingState label="Loading account data..." />;
  }

  if (!data?.account) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-500">
        <p>{error ? "Unable to load account data." : "No account data found."}</p>
        <button type="button" onClick={() => router.push("/workbench")} className="text-[12px] font-semibold text-blue-600 hover:underline">
          Back to Collector Workbench
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-full min-w-0 pr-2 text-slate-700 sm:pr-4" data-has-error={Boolean(error)}>
      <div className="mx-auto max-w-[1680px]">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[12px] text-slate-600">
            <ChevronLeft className="h-4 w-4" />
            <Link href="/workbench" className="hover:text-blue-600 hover:underline">
              {breadcrumb[0]}
            </Link>
            <span>›</span>
            <span>{breadcrumb[1]}</span>
            <span>›</span>
            <b className="text-slate-800">{breadcrumb[2]}</b>
          </nav>
          <div className="flex items-center gap-3 text-[12px] text-slate-600">
            <span>Last updated: {lastUpdated}</span>
            <button
              type="button"
              onClick={() => {
                setRefreshing(true);
                load();
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 font-semibold text-blue-700 shadow-sm hover:bg-slate-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        <Account360Detail
          key={account.id}
          account={account}
          industry={industry}
          aging={aging}
          transactions={transactions}
          ptpHistory={ptpHistory}
          ptpTotal={ptpTotal}
          onAction={handleAction}
        />

        <div role="tablist" aria-label="Account sections" className="mt-4 flex flex-wrap gap-2">
          {TABS.map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={tab === name}
              onClick={() => setTab(name)}
              className={`inline-flex h-10 items-center gap-2 rounded-full border px-5 text-[13px] font-medium transition-colors ${
                tab === name ? "border-blue-600 bg-blue-600 text-white shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
              }`}
            >
              {name}
              {name === "PTP History" && (
                <span className={`rounded-full px-2 text-[11px] ${tab === name ? "bg-white/20" : "bg-slate-100 text-slate-600"}`}>{ptpTotal}</span>
              )}
            </button>
          ))}
        </div>

        {tab === "Overview" && (
          <Overview
            account={account}
            information={information}
            aging={aging}
            totalAr={totalAr}
            recentActivity={data?.recentActivity ?? []}
            riskIndicators={data?.riskIndicators ?? []}
            ptpHistory={ptpHistory}
            asOfDate={data?.asOfDate}
            onViewActivity={() => setTab("PTP History")}
            onViewRisk={() => setTab("Risk & Insights")}
          />
        )}

        {tab === "Transactions" && <Transactions transactions={transactions} accountId={account.id} />}

        {tab === "PTP History" && <PTPhistory history={ptpHistory} meta={ptpMeta} />}

        {PLACEHOLDERS[tab] && (
          <section className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-[14px] font-bold text-slate-800">{tab}</h2>
            <p className="text-[12px] text-slate-500">{PLACEHOLDERS[tab]}</p>
          </section>
        )}
      </div>
    </main>
  );
}

export default function Account360Page() {
  return (
    <Suspense fallback={<LoadingState label="Loading account data..." />}>
      <Account360Content />
    </Suspense>
  );
}
