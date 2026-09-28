"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

// const detectionSource = [
//   { name: "Rule-Based", value: 126, percent: "45.0%", color: "#2563EB" },
//   { name: "Agentic AI", value: 98, percent: "37.0%", color: "#7C3AED" },
//   { name: "Hybrid (Rule + AI)", value: 41, percent: "15.5%", color: "#0F9FAF" },
// ];

// const findingTypes = [
//   { name: "True Duplicates", value: 76, percent: "28.7%" },
//   { name: "Near Duplicates", value: 81, percent: "30.6%" },
//   { name: "Potential Duplicates (AI)", value: 54, percent: "20.4%" },
//   { name: "Amount Anomalies", value: 28, percent: "10.6%" },
//   { name: "Currency Deviations", value: 16, percent: "6.0%" },
//   { name: "Recurring Duplications", value: 10, percent: "3.8%" },
// ];

// const riskDistribution = [
//   { name: "Critical", value: 46, percent: "17.4%", color: "#DC2626" },
//   { name: "High", value: 87, percent: "32.8%", color: "#F97316" },
//   { name: "Medium", value: 96, percent: "36.2%", color: "#FBBF24" },
//   { name: "Low", value: 36, percent: "13.6%", color: "#5B9FA5" },
// ];

// const paymentStatus = [
//   { name: "Paid", value: 128, percent: "48.3%", color: "#DC2626" },
//   { name: "Waiting", value: 97, percent: "36.6%", color: "#F97316" },
//   { name: "Blocked", value: 21, percent: "7.9%", color: "#4F46A5" },
//   { name: "Other", value: 19, percent: "7.2%", color: "#9CA3AF" },
// ];

const panelClass = "min-w-0 rounded-[10px] border border-[#E2E8F0] bg-white p-4 shadow-[0px_1px_4px_rgba(15,23,42,0.05)]";

function DonutPanel({ title, data }) {
  return (
    <article className={panelClass}>
      <h3 className="text-[13px] font-semibold text-[#0F172A]">{title}</h3>
      <div className="mt-4 flex items-center gap-4">
        <div className="h-[104px] w-[104px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={31} outerRadius={48} paddingAngle={2} stroke="none">
                {data.map((item) => <Cell key={item.name} fill={item.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="min-w-0 space-y-2 text-[10px] text-[#334155]">
          {data.map((item) => (
            <div key={item.name} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="min-w-0 leading-3">
                {item.name}
                <strong className="block font-semibold text-[#0F172A]">{item.value} ({item.percent})</strong>
              </span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

const chartColors = ["#2563EB", "#7C3AED", "#0F9FAF", "#DC2626", "#F97316", "#9CA3AF"];

function normalizeChart(items, labelKey) {
  return Array.isArray(items)
    ? items.map((item, index) => ({
        name: item.name ?? item[labelKey] ?? "Unknown",
        value: Number(item.value ?? 0),
        percent: item.percent ?? "0%",
        color: chartColors[index % chartColors.length],
      }))
    : [];
}

export default function CasesAnalyticsRow({ data }) {
  const detectionSourceData = normalizeChart(data?.detectionSource, "name");
  const findingTypesData = normalizeChart(data?.findingTypes, "name");
  const riskDistributionData = normalizeChart(data?.riskDistribution, "riskLevel");
  const paymentStatusData = normalizeChart(data?.paymentStatus, "status");
  const maxFindingValue = Math.max(...findingTypesData.map((item) => item.value), 1);

  return (
    <section className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4 xl:grid-cols-4">
      <DonutPanel title="Detection Source" data={detectionSourceData} />
      <article className={panelClass}>
        <h3 className="text-[13px] font-semibold text-[#0F172A]">Finding Type</h3>
        <div className="mt-4 space-y-2 text-[10px] text-[#334155]">
          {findingTypesData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <span className="w-[126px] shrink-0 truncate">{item.name}</span>
              <span className="h-[7px] flex-1 rounded-sm bg-[#E2E8F0]">
                <span className="block h-full rounded-sm bg-[#3978D8]" style={{ width: `${(item.value / maxFindingValue) * 100}%` }} />
              </span>
              <span className="w-[58px] text-right">{item.value} ({item.percent})</span>
            </div>
          ))}
        </div>
      </article>
      <DonutPanel title="Risk Distribution" data={riskDistributionData} />
      <DonutPanel title="Payment Status" data={paymentStatusData} />
    </section>
  );
}