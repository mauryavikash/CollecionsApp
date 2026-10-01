import { AlertCircle, BarChart3, DollarSign, Signal } from "lucide-react";
import KpiCardsGrid from "@/components/common/KpiCardsGrid";

const KPI_ICONS = { sparkline: DollarSign, aging: AlertCircle, risk: AlertCircle, ptp: Signal, recovery: BarChart3 };
const KPI_TONES = {
  sparkline: { iconBg: "#ecfdf5", iconColor: "#059669" }, aging: { iconBg: "#fff1f2", iconColor: "#f43f5e" }, risk: { iconBg: "#fffbeb", iconColor: "#d97706" }, ptp: { iconBg: "#ecfdf5", iconColor: "#059669" }, recovery: { iconBg: "#eff6ff", iconColor: "#2563eb" },
};

export default function CollectionKpiCard({ kpis = [] }) {
  return <KpiCardsGrid items={kpis} columns="lg:grid-cols-5" renderItem={(metric) => <DashboardKpi metric={metric} />} />;
}

function DashboardKpi({ metric }) {
  const Icon = KPI_ICONS[metric.type];
  const tone = KPI_TONES[metric.type];
  const valueColor = metric.type === "aging" ? "text-[#f15258]" : metric.type === "risk" ? "text-[#e88825]" : metric.type === "ptp" ? "text-emerald-600" : "text-slate-800";
  const barColors = metric.type === "aging" ? ["#4bc173", "#9bd138", "#ffd12a", "#fb9337", "#f15a63"] : metric.type === "recovery" ? ["#48bb77", "#48bb77", "#48bb77", "#b5daf8", "#b5daf8", "#b5daf8"] : ["#d5ebfc", "#bcddfa", "#a7d1f4", "#2367bd", "#2367bd", "#2367bd", "#2367bd"];
  const sparkline = metric.type === "sparkline" && metric.values.map((value, index) => `${index * 14},${34 - value}`).join(" ");

  return <article className="relative h-[82px] overflow-hidden rounded-[10px] border-2 border-[#2858c5] border-b-[#13c4c8] bg-white px-2.5 py-2 shadow-[0_2px_5px_rgba(38,82,144,.12)]"><div className="flex justify-between gap-2"><p className="text-[10px] font-semibold leading-3 text-slate-600">{metric.label}</p><span className="grid h-5 w-5 shrink-0 place-items-center rounded-md" style={{ backgroundColor: tone.iconBg }}><Icon size={12} style={{ color: tone.iconColor }} /></span></div><p className={`mt-1 text-[18px] font-bold leading-5 ${valueColor}`}>{metric.value}{metric.type === "recovery" && <small className="ml-1 text-[8px] font-medium text-slate-500">/ 7 Days</small>}</p>{metric.type === "ptp" ? <p className="mt-0.5 text-[8px]"><b className="text-emerald-600">{metric.active}</b><b className="ml-2 text-amber-600">{metric.broken} Broken</b></p> : metric.type === "recovery" ? <p className="text-[10px] font-bold text-blue-600">{metric.secondaryValue}<small className="ml-1 text-[8px] font-medium text-slate-500">/ 30 Days</small></p> : metric.type === "risk" ? <p className="mt-1 text-[8px] text-[#f15258]">{metric.context}</p> : <p className={`mt-1 text-[8px] font-semibold ${metric.type === "aging" ? "text-[#f15258]" : "text-emerald-600"}`}>{metric.trend}<span className="ml-1 font-medium text-slate-400">{metric.context}</span></p>}{metric.type === "risk" && <div className="mt-1 flex gap-1.5 text-[8px] font-semibold">{metric.values.map((risk) => <span key={risk.color} className="flex items-center gap-0.5"><i className="h-2 w-2 rounded-sm" style={{ backgroundColor: risk.color }} />{risk.value}</span>)}</div>}{sparkline && <svg className="absolute bottom-2 right-2 h-9 w-[68px]" viewBox="0 0 57 36" aria-label="Accounts receivable trend"><polyline points={sparkline} fill="none" stroke="#51ba7a" strokeWidth="1.4" />{metric.values.map((value, index) => <circle key={`${value}-${index}`} cx={index * 14} cy={34 - value} r="1.8" fill="#51ba7a" />)}</svg>}{(metric.type === "aging" || metric.type === "ptp" || metric.type === "recovery") && <div className="absolute bottom-1.5 right-2 flex h-7 items-end gap-1">{metric.values.map((value, index) => <i key={`${metric.id}-${index}`} className="w-3 rounded-t-[2px]" style={{ height: value, backgroundColor: barColors[index] }} />)}</div>}</article>;
}