import {
  DollarSign,
  CheckCircle2,
  TrendingUp,
  Clock3,
  ShieldCheck,
} from "lucide-react";
import KpiCardsGrid from "../common/KpiCardsGrid";

const visualConfig = [
  {
    icon: DollarSign,
    iconColor: "#10B981",
    iconBg: "#DCFCE7",
    positive: true,
    invoiceCount: "2,915",
    invoiceValue: "$3.42M",
  },
  {
    icon: CheckCircle2,
    iconColor: "#3B82F6",
    iconBg: "#DBEAFE",
    positive: true,
    invoiceCount: "2,086",
    invoiceValue: "$2.45M",
  },
  {
    icon: TrendingUp,
    iconColor: "#F59E0B",
    iconBg: "#FEF3C7",
    positive: true,
    invoiceCount: "612",
    invoiceValue: "$0.72M",
  },

  {
    icon: ShieldCheck,
    iconColor: "#06B6D4",
    iconBg: "#CFFAFE",
    positive: true,
    invoiceCount: "2,603",
    invoiceValue: "$3.05M",
  },
];

const formatCurrency = (value) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
}).format(Number(value ?? 0));

export const RecoveriesKpiCards = ({ data }) => {
  const kpiData = Array.isArray(data)
    ? data.map((item, index) => {
        const config = visualConfig[index] ?? visualConfig[0];
        const isRate = item.metric === "Recovery Success Rate";

        return {
          ...config,
          title: item.metric,
          value: isRate ? `${item.value ?? 0}%` : formatCurrency(item.value),
          change: `${Number(item.changePercentage ?? 0) >= 0 ? "+" : ""}${item.changePercentage ?? 0}%`,
          comparison: "vs prior period",
          invoiceCount: Number(item.invoiceCount ?? 0).toLocaleString(),
          invoiceValue: formatCurrency(item.invoiceValue),
        };
      })
    : [];

  return <KpiCardsGrid items={kpiData} columns="xl:grid-cols-4" />;
};

