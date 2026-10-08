
"use client";

import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";

import Account360Detail from "@/components/account/Account360Detail";
import Overview from "@/components/account/Overview";
import Transactions from "@/components/account/Transactions";
import PTPhistory from "@/components/account/PTPhistory";
import { LoadingState } from "@/components/common/LoadingState";
import { getAccount } from "@/app/lib/api";

export default function Account360Page() {
  const [accountApiData, setAccountApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("Overview");

  useEffect(() => {
    let isMounted = true;

    async function loadAccountData() {
      try {
        setLoading(true);
        setError(null);

        const response = await getAccount();
        const payload = response?.data ?? response;

        if (
          isMounted &&
          payload &&
          typeof payload === "object"
        ) {
          setAccountApiData(payload);
        }
      } catch (err) {
        console.error("Account 360 API Error:", err);

        if (isMounted) {
          setError(err);
          setAccountApiData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAccountData();

    return () => {
      isMounted = false;
    };
  }, []);

  const resolvedAccountData =
    accountApiData?.account360 ??
    accountApiData ??
    {};

  if (loading) {
    return (
      <LoadingState label="Loading account data..." />
    );
  }

  if (
    !resolvedAccountData ||
    Object.keys(resolvedAccountData).length === 0
  ) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        No Account Data Found
      </div>
    );
  }

  return (
    <main
      className="min-h-full text-slate-700"
      aria-busy={loading}
      data-has-error={Boolean(error)}
    >
      <div className="mx-auto max-w-[1600px]">
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex items-center gap-2 text-[11px] text-slate-500"
        >
          <ChevronLeft className="h-4 w-4" />

          <span>Collector Workbench</span>
          <span>›</span>

          <span>
            {resolvedAccountData?.account?.name || "-"}
          </span>

          <span>›</span>

          <b className="text-slate-700">
            Account 360
          </b>
        </nav>

        <Account360Detail
          account={
            resolvedAccountData?.account || {}
          }
        />

        <div
          role="tablist"
          className="mt-6 flex gap-2"
        >
          {[
            "Overview",
            "Transactions",
            "PTP History",
          ].map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={tab === name}
              onClick={() => setTab(name)}
              className={`rounded-full px-4 py-2 text-[10px] font-medium ${
                tab === name
                  ? "bg-[#225ce0] text-white"
                  : "bg-white text-slate-500"
              }`}
            >
              {name}

              {name === "PTP History" && (
                <span className="ml-2 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-600">
                  {resolvedAccountData?.ptpHistory
                    ?.length || 0}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === "Overview" && (
          <Overview
            data={{
              account:
                resolvedAccountData?.account || {},
              information:
                resolvedAccountData?.information ||
                [],
              aging:
                resolvedAccountData?.aging || [],
            }}
          />
        )}

        {tab === "Transactions" && (
          <Transactions
            transactions={
              resolvedAccountData?.transactions ||
              []
            }
          />
        )}

        {tab === "PTP History" && (
          <PTPhistory
            history={
              resolvedAccountData?.ptpHistory ||
              []
            }
          />
        )}
      </div>
    </main>
  );
}