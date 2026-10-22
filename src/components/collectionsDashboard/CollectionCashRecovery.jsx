
"use client";

import { useMemo, useState } from "react";
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
      className={`rounded-[11px] border border-slate-200 bg-white px-3 py-2.5 shadow-[0_2px_5px_rgba(38,82,144,.08)] ${className}`}
    >
      {children}
    </section>
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

  const chartData = forecast.map((item) => ({
    ...item,
    actual:
      Number(item.actual) > 0
        ? Number(item.actual)
        : null,
    projected: Number(item.projected) || 0,
  }));

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1.2fr)]">
      {/* CASH RECOVERY FORECAST */}
      <Panel className="min-h-[300px] min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-[13px] font-bold">
              CASH RECOVERY FORECAST
            </h2>

            <p className="text-[9px] text-slate-500">
              Projected vs actual · Next 30 days
            </p>
          </div>

          <select className="h-[26px] appearance-none rounded-md border border-slate-200 bg-white px-2 pr-6 text-[10px] text-slate-600 outline-none">
            <option>Next 30 days</option>
            <option>Next 60 days</option>
            <option>Next 90 days</option>
          </select>
        </div>

        <div
          className="h-[250px] mt-2"
          role="img"
          aria-label="Cash recovery forecast through month two"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              barGap={2}
              barCategoryGap="30%"
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
              <Tooltip
                cursor={{ fill: "rgba(34,101,189,0.06)" }}
                formatter={(value, name) => [
                  formatMoney(value),
                  name === "actual" ? "Actual" : "Projected",
                ]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                }}
              />

              <Legend
                verticalAlign="top"
                align="right"
                iconType="square"
                iconSize={8}
                wrapperStyle={{ fontSize: "10px", paddingBottom: "8px" }}
                formatter={(value) => (value === "actual" ? "Actual" : "Projected")}
              />

              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 10,
                  fill: "#64748b",
                }}
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
                  fontSize: 9,
                  fill: "#64748b",
                }}
                width={60}
              />

              <Bar
                dataKey="projected"
                fill="#b7daf8"
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="actual"
                fill="#2265bd"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

{/* TOP RISK ACCOUNTS */}
<Panel className="min-h-[300px] min-w-0 flex flex-col">
  <div className="mb-3 flex items-center justify-between">
    <h2 className="text-[13px] font-bold flex items-center gap-1">
      <span className="text-red-500">&#9888;</span> Top Risk Accounts <span className="text-slate-400">&rsaquo;</span>
    </h2>
    <button type="button" className="text-[10px] font-semibold text-blue-600 hover:underline">
      View All &rsaquo;
    </button>
  </div>

  <div className="overflow-hidden rounded-lg border border-slate-200 flex-1 flex flex-col">
    {/* Header */}
    <div className="grid grid-cols-[56px_minmax(0,1fr)_48px_90px] bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-500 sm:grid-cols-[70px_minmax(0,1fr)_70px_110px]">
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
                  <div className="text-[10px] text-slate-400">
                    {account.dpd} DPD &bull; {account.dpdBucket}
                  </div>
                </td>
                <td className="w-[48px] px-2 py-3 text-center align-middle text-[13px] font-semibold text-slate-700 sm:w-[70px] sm:text-[14px]">
                  {account.dpd}
                </td>
                <td className="w-[90px] px-3 py-3 text-right align-middle sm:w-[110px]">
                  <div className="text-[14px] font-bold" style={{ color: account.segmentColor || "#f2545b" }}>
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

    {/* Pagination */}
    {riskTotalPages > 1 && (
      <div className="flex items-center justify-center gap-1 border-t border-slate-100 py-2">
        <button
          onClick={() => setRiskPage((p) => Math.max(1, p - 1))}
          disabled={riskPage === 1}
          className="flex h-6 w-6 items-center justify-center rounded text-[10px] border border-slate-200 disabled:opacity-40"
        >
          &lsaquo;
        </button>
        {Array.from({ length: riskTotalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setRiskPage(p)}
            className={`flex h-6 w-6 items-center justify-center rounded text-[10px] ${
              riskPage === p ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => setRiskPage((p) => Math.min(riskTotalPages, p + 1))}
          disabled={riskPage === riskTotalPages}
          className="flex h-6 w-6 items-center justify-center rounded text-[10px] border border-slate-200 disabled:opacity-40"
        >
          &rsaquo;
        </button>
      </div>
    )}
  </div>
</Panel>
    </div>
  );
}