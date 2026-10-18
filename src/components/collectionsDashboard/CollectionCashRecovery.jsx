
"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function Panel({ children, className = "" }) {
  return (
    <section
      className={`rounded-[11px] border border-slate-200 bg-white px-3 py-2.5 shadow-[0_2px_5px_rgba(38,82,144,.08)] ${className}`}
    >
      {children}
    </section>
  );
}

export default function CollectionCashRecovery({
  forecast = [],
  riskAccounts = [],
}) {
  const chartData = forecast.map((item) => ({
    ...item,
    actual:
      Number(item.actual) > 0
        ? Number(item.actual)
        : null,
    projected: Number(item.projected) || 0,
  }));

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.8fr_1.2fr]">
      {/* CASH RECOVERY FORECAST */}
      <Panel className="min-h-[300px]">
        <div className="flex justify-between">
          <div>
            <h2 className="text-[13px] font-bold">
              CASH RECOVERY FORECAST
            </h2>

            <p className="text-[9px] text-slate-500">
              Projected vs actual · Next 30 days
            </p>
          </div>

          <div className="flex items-center gap-3 text-[9px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-[#2265bd]" />
              Actual
            </span>

            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-[#b7daf8]" />
              Projected
            </span>
          </div>
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
                  `${value} ${forecast?.[0]?.unit || ""}`,
                  name === "actual" ? "Actual" : "Projected",
                ]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                }}
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
                tickFormatter={(value) =>
                  `${value}${forecast?.[0]?.unit ? ` ${forecast[0].unit}` : ""}`
                }
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
<Panel className="min-h-[300px]">
  <h2 className="mb-3 text-[13px] font-bold">
    TOP RISK ACCOUNTS
  </h2>

  <div className="overflow-hidden rounded-lg border border-slate-200">
    {/* Header */}
    <div className="grid grid-cols-[90px_1fr_90px_140px] bg-slate-50 px-4 py-3 text-[11px] font-bold text-slate-600">
      <div>RISK</div>
      <div>CUSTOMER</div>
      <div className="text-center">DPD</div>
      <div className="text-right">OVERDUE AMOUNT</div>
    </div>

    {/* Rows */}
    <div
      className="overflow-y-auto"
      style={{ height: "250px" }}
    >
      {riskAccounts?.length > 0 ? (
        <table className="w-full table-fixed">
          <tbody>
            {riskAccounts.map((account, index) => (
              <tr
                key={account.id || index}
                className="border-t border-slate-100"
              >
                {/* Risk */}
                <td className="w-[90px] px-4 py-4 align-top">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-[20px] font-bold text-white"
                    style={{
                      backgroundColor:
                        account.segmentColor || "#f2545b",
                    }}
                  >
                    {account.riskScore}
                  </div>
                </td>

                {/* Customer */}
                <td className="px-2 py-4 align-top">
                  <div
                    className="truncate text-[13px] font-semibold text-slate-800"
                    title={account.customer}
                  >
                    {account.customer}
                  </div>

                  <div className="mt-1 text-[11px] text-slate-500">
                    {account.dpd} DPD • {account.dpdBucket}
                  </div>
                </td>

                {/* DPD */}
                <td className="w-[90px] px-2 py-4 text-center align-top">
                  <div className="text-[16px] font-semibold text-slate-700">
                    {account.dpd}
                  </div>
                </td>

                {/* Overdue Amount */}
                <td className="w-[140px] px-4 py-4 text-right align-top">
                  <div
                    className="text-[16px] font-bold"
                    style={{
                      color:
                        account.segmentColor || "#f2545b",
                    }}
                  >
                    {account.overdueAmount}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="py-8 text-center text-sm text-slate-500">
          No risk accounts available
        </div>
      )}
    </div>
  </div>
</Panel>
    </div>
  );
}