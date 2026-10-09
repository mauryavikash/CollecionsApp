"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
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
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr]">
      {/* CASH RECOVERY FORECAST */}
      <Panel className="h-[163px]">
        <div className="flex justify-between">
          <div>
            <h2 className="text-[11px] font-bold">
              CASH RECOVERY FORECAST
            </h2>

            <p className="text-[8px] text-slate-500">
              Projected vs actual · Next 30 days
            </p>
          </div>

          <div className="flex items-center gap-3 text-[8px] text-slate-500">
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
          className="h-[115px]"
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
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 10,
                  fill: "#64748b",
                }}
              />

              {/* <YAxis
                domain={[0, "dataMax + 5000"]}
                tickFormatter={(value) =>
                  `${Math.round(value / 1000)}K`
                }
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 8,
                  fill: "#64748b",
                }}
                width={40}
              /> */}

              <YAxis
                domain={[
                  0,
                  (dataMax) => Math.ceil(dataMax * 1.2),
                ]}
                tickFormatter={(value) =>
                  `${value} ${forecast?.[0]?.unit || ""}`
                }
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 8,
                  fill: "#64748b",
                }}
                width={50}
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
      <Panel className="h-[163px]">
        <div className="flex justify-between">
          <h2 className="text-[11px] font-bold">
            TOP RISK ACCOUNTS
          </h2>

          <button
            type="button"
            className="text-[9px] font-semibold text-blue-600"
          >
            View all
          </button>
        </div>

        <div className="mt-2">
          {riskAccounts.map((account) => (
            <div
              key={account.name}
              className="flex h-[28px] items-center border-b border-slate-100 last:border-0"
            >
              <b className="mr-2 grid h-4 w-4 place-items-center rounded-full bg-[#f2545b] text-[7px] text-white">
                {account.score}
              </b>

              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-[9px] font-bold">
                  {account.name}
                </p>

                <p className="text-[7px] text-slate-500">
                  {account.detail}
                </p>
              </div>

              <b className="text-[9px] text-[#f2545b]">
                {account.amount}
              </b>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}