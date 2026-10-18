"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
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

export default function CollectionChart({
  riskDistribution = [],
  collectors = [],
  
  

}) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.2fr_1.8fr]">
      {/* RISK DISTRIBUTION */}
      <Panel className="h-[250px]">
        <h2 className="text-[13px] font-bold">
          RISK DISTRIBUTION
        </h2>

        <div className="mt-2 flex h-[200px] items-center">
          <div
            className="h-[180px] w-[180px] shrink-0"
            role="img"
            aria-label="Risk distribution across low, medium, high, and critical risk"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value}%`,
                    props?.payload?.label || "",
                  ]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />

                <Pie
                  data={riskDistribution}
                  dataKey="percentage"
                  innerRadius={50}
                  outerRadius={72}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell
                      key={`${entry.label}-${index}`}
                      fill={entry.color}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            {riskDistribution.map((risk, index) => (
              <p
                key={`${risk.label}-${index}`}
                className="grid grid-cols-[1fr_70px_40px] gap-2 text-[12px] font-semibold"
              >
                <span className="flex items-center gap-2 text-slate-600">
                  <i
                    className="h-2 w-2 rounded-sm"
                    style={{ backgroundColor: risk.color }}
                  />
                  {risk.label}
                </span>

                <span>{risk.amount}</span>

                <span>{risk.percentage}%</span>
              </p>
            ))}
          </div>
        </div>
      </Panel>

      {/* COLLECTOR PERFORMANCE */}
      <Panel className="h-[250px]">
        <h2 className="text-[13px] font-bold">
          COLLECTOR PERFORMANCE (SEP 2026)
        </h2>

        <div
          className="mt-3 overflow-y-auto pr-2"
          style={{ maxHeight: "195px" }}
        >
          <div className="space-y-3">
            {collectors.map((collector, index) => (
              <div key={`${collector.name}-${index}`}>
                <p className="mb-1 flex justify-between text-[11px] font-semibold">
                  <span>{collector.name}</span>

                  <span style={{ color: collector.color }}>
                    {collector.percentage}%
                    <small className="ml-1 font-medium text-slate-500">
                      ({collector.achieved}/{collector.target})
                    </small>
                  </span>
                </p>

                <div className="h-2 rounded bg-slate-200">
                  <div
                    className="h-full rounded transition-all duration-300"
                    style={{
                      width: `${collector.percentage}%`,
                      backgroundColor: collector.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}