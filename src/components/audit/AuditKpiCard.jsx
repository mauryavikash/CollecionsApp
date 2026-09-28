import {
  CheckSquare,
  PieChart,
  CircleDollarSign,
  RotateCcw,
  Users,
  Sparkles
} from "lucide-react";
import KpiCardsGrid from "../common/KpiCardsGrid";


const visualConfig = [
  {
    icon: CheckSquare,
    iconColor: "#2563EB",
    iconBg: "#DBEAFE",
    supportingColor: "text-[#10B981]",
  },

  {
    icon: Users,
    iconColor: "#2563EB",
    iconBg: "#DBEAFE",
    supportingColor: "text-[#10B981]",
  },
  {
    icon: CircleDollarSign,
    iconColor: "#10B981",
    iconBg: "#DCFCE7",
    supportingColor: "text-[#10B981]",
  },
  {
    icon: RotateCcw,
    iconColor: "#2563EB",
    iconBg: "#DBEAFE",
    supportingColor: "text-[#10B981]",
  },
  {
    icon: Sparkles,
    iconColor: "#ffffff",
    iconBg: "#7C3AED",
    supportingColor: "text-[#10B981]",
  },
];

const formatCurrency = (value) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
}).format(Number(value ?? 0));

export const AuditKpiCards = ({ data }) => {
  const kpiData = Array.isArray(data)
    ? data.map((item, index) => ({
        ...(visualConfig[index] ?? visualConfig[0]),
        title: item.metric,
        value: item.metric === "Recovery Value"
          ? formatCurrency(item.value)
          : Number(item.value ?? 0).toLocaleString(),
        supporting: "Current period",
        invoiceCount: Number(item.invoiceCount ?? 0).toLocaleString(),
        invoiceValue: formatCurrency(item.invoiceValue),
      }))
    : [];

  return <KpiCardsGrid items={kpiData} columns="xl:grid-cols-5" variant="audit" />;
};
