
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { forecastWeekRange } from "@/components/common/dateRanges";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/* Auto-scale dollar values: $1.2B / $18.0M / $250.5K / $42 */
function formatMoney(v) {
  const n = Number(v) || 0;
  const a = Math.abs(n);
  if (a >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (a >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (a >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function Panel({ children, className = "" }) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

/* Two-line X tick: "Wk 1" + "17 Sep – 23 Sep 2026" */
function WeekTick({ x, y, payload, index, data }) {
  const row = data?.[index];
  return (
    <g transform={`translate(${x},${y})`}>
      <text dy={12} textAnchor="middle" fontSize={11} fontWeight={600} fill="#334155">
        {payload?.value}
      </text>
      {row?.range && (
        <text dy={26} textAnchor="middle" fontSize={10} fill="#64748b">
          {row.range}
        </text>
      )}
    </g>
  );
}

function ForecastTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload ?? {};
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <div className="font-semibold text-slate-800">{row.week}</div>
      {row.range && <div className="mb-1 text-[11px] text-slate-500">{row.range}</div>}
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-1.5 text-slate-600">
          <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: entry.color }} />
          {entry.dataKey === "actual" ? "Actual" : "Projected"}:
          <span className="font-semibold text-slate-900">{formatMoney(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* Normalize API risk-account rows to the shape the template expects.
   API returns: { score, name, detail, amount }
   Template needs: { riskScore, customer, dpd, dpdBucket, overdueAmount, segmentColor } */
function normalizeRiskAccount(raw) {
  if (raw.riskScore !== undefined) return raw; // already normalized
  const score = raw.score ?? raw.riskScore ?? 0;
  const detail = raw.detail ?? "";
  const dpdMatch = detail.match(/(\d+)\s*DPD/);
  const dpd = dpdMatch ? parseInt(dpdMatch[1], 10) : (raw.dpd ?? 0);
  const bucketMatch = detail.match(/DPD\.?\s*(.+)/);
  const dpdBucket = bucketMatch ? bucketMatch[1].trim() : (raw.dpdBucket ?? "");
  let color = "#f2545b";
  if (score >= 80) color = "#f2545b";
  else if (score >= 60) color = "#ff9f43";
  else if (score >= 40) color = "#ffd23f";
  else color = "#50c878";
  return {
    ...raw,
    riskScore: score,
    customer: raw.name ?? raw.customer ?? "",
    dpd,
    dpdBucket: dpdBucket || (dpd > 180 ? "181+ days" : dpd > 90 ? "91-180 days" : dpd > 60 ? "61-90 days" : dpd > 30 ? "31-60 days" : dpd > 0 ? "1-30 days" : "Current"),
    overdueAmount: raw.amount ?? raw.overdueAmount ?? "$0",
    segmentColor: raw.segmentColor ?? color,
  };
}

export default function CollectionCashRecovery({
  forecast = [],
  riskAccounts = [],
  asOfIso,
}) {
  const [riskPage, setRiskPage] = useState(1);
  const RISK_PAGE_SIZE = 4;
  const normalizedRisk = useMemo(
    () => (riskAccounts || []).map(normalizeRiskAccount),
    [riskAccounts],
  );
  const riskTotalPages = Math.max(1, Math.ceil(normalizedRisk.length / RISK_PAGE_SIZE));
  const paginatedRisk = useMemo(() => {
    const start = (riskPage - 1) * RISK_PAGE_SIZE;
    return normalizedRisk.slice(start, start + RISK_PAGE_SIZE);
  }, [normalizedRisk, riskPage]);

  const unitMultiplier = (unit) => (unit === "B" ? 1e9 : unit === "K" ? 1e3 : unit === "M" || unit === undefined ? 1e6 : 1);
  const chartData = forecast.map((item, index) => {
    const multiplier = unitMultiplier(item?.unit);
    const actualRaw = Number(item?.actualRaw ?? Number(item?.actual) * multiplier);
    const projectedRaw = Number(item?.projectedRaw ?? Number(item?.projected) * multiplier);
    return {
      ...item,
      week: item?.label ?? `Wk ${index + 1}`,
      range: forecastWeekRange(asOfIso, index),
      actual: actualRaw > 0 ? actualRaw : null,
      projected: projectedRaw || 0,
    };
  });
  const forecastTitle = chartData.length && asOfIso
    ? `${chartData[0].range?.split(" – ")[0]} – ${chartData[chartData.length - 1].range?.split(" – ")[1]}`
    : null;

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1.2fr)]">
      {/* CASH RECOVERY FORECAST */}
      <Panel className="min-h-[300px] min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Cash Recovery Forecast
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Projected vs actual · Next 30 days{forecastTitle ? ` (${forecastTitle})` : ""}
            </p>
          </div>

          <select className="h-8 appearance-none rounded-lg border border-slate-200 bg-white px-2 pr-6 text-xs text-slate-600 outline-none">
            <option>Next 30 days</option>
            <option>Next 60 days</option>
            <option>Next 90 days</option>
          </select>
        </div>

        <div
          className="h-[270px] mt-2"
          role="img"
          aria-label="Cash recovery forecast by week"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              barGap={2}
              barCategoryGap="30%"
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <Tooltip
                cursor={{ fill: "rgba(34,101,189,0.06)" }}
                content={<ForecastTooltip />}
              />

              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="square"
                iconSize={9}
                wrapperStyle={{ fontSize: "12px", paddingTop: "6px" }}
                formatter={(value) => (
                  <span className="text-slate-600">{value === "actual" ? "Actual" : "Projected"}</span>
                )}
              />

              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={false}
                interval={0}
                height={36}
                tick={<WeekTick data={chartData} />}
              />

              <YAxis
                domain={[
                  0,
                  (dataMax) => Math.ceil(dataMax * 1.2),
                ]}
                tickFormatter={formatMoney}
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 11,
                  fill: "#64748b",
                }}
                width={60}
              />

              <Bar
                dataKey="projected"
                fill="#93bbff"
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="actual"
                fill="#2865dc"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

{/* TOP RISK ACCOUNTS */}
<Panel className="min-h-[300px] min-w-0 flex flex-col">
  <div className="mb-3 flex items-center justify-between">
    <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50">
        <AlertTriangle className="h-4 w-4 text-rose-500" aria-hidden="true" />
      </span>
      Top Risk Accounts
    </h2>
  </div>

  <div className="overflow-hidden rounded-lg border border-slate-200 flex-1 flex flex-col">
    {/* Header */}
    <div className="grid grid-cols-[56px_minmax(0,1fr)_48px_90px] bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:grid-cols-[70px_minmax(0,1fr)_70px_110px]">
      <div>RISK</div>
      <div>CUSTOMER</div>
      <div className="text-center">DPD</div>
      <div className="text-right">OVERDUE AMOUNT</div>
    </div>

    {/* Rows */}
    <div className="flex-1">
      {paginatedRisk.length > 0 ? (
        <table className="w-full table-fixed">
          <tbody>
            {paginatedRisk.map((account, index) => (
              <tr
                key={account.id || index}
                className="border-t border-slate-100 hover:bg-slate-50"
              >
                <td className="w-[56px] px-3 py-3 align-middle sm:w-[70px]">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold text-white sm:h-10 sm:w-10 sm:text-[16px]"
                    style={{ backgroundColor: account.segmentColor || "#f2545b" }}
                    title={`Risk Score: ${account.riskScore}`}
                  >
                    {account.riskScore}
                  </div>
                </td>
                <td className="px-2 py-3 align-middle">
                  <div className="truncate text-[12px] font-semibold text-slate-800" title={account.customer}>
                    {account.customer}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {account.dpd} DPD &bull; {account.dpdBucket}
                  </div>
                </td>
                <td className="w-[48px] px-2 py-3 text-center align-middle text-[13px] font-semibold text-slate-700 sm:w-[70px] sm:text-[14px]">
                  {account.dpd}
                </td>
                <td className="w-[90px] px-3 py-3 text-right align-middle sm:w-[110px]">
                  <div className="text-[13px] font-bold" style={{ color: account.segmentColor || "#f2545b" }}>
                    {account.overdueAmount}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="py-8 text-center text-sm text-slate-500">No risk accounts available</div>
      )}
    </div>

    {/* Pagination + View All (bottom right) */}
    <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-3 py-2">
      <div className="flex items-center gap-1">
        {riskTotalPages > 1 && (
          <>
            <button
              onClick={() => setRiskPage((p) => Math.max(1, p - 1))}
              disabled={riskPage === 1}
              className="flex h-6 w-6 items-center justify-center rounded text-xs border border-slate-200 disabled:opacity-40"
            >
              &lsaquo;
            </button>
            {Array.from({ length: riskTotalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setRiskPage(p)}
                className={`flex h-6 w-6 items-center justify-center rounded text-xs ${
                  riskPage === p ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setRiskPage((p) => Math.min(riskTotalPages, p + 1))}
              disabled={riskPage === riskTotalPages}
              className="flex h-6 w-6 items-center justify-center rounded text-xs border border-slate-200 disabled:opacity-40"
            >
              &rsaquo;
            </button>
          </>
        )}
      </div>
     
    </div>
  </div>
</Panel>
    </div>
  );
}