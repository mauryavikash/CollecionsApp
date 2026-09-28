import {
  Bell,
  ShieldAlert,
  TriangleAlert,
  ShieldCheck,
  Info,
  BellOff,
} from "lucide-react";
import KpiCardsGrid from "../common/KpiCardsGrid";

const visualConfig = [
  {
    supportingColor: "text-[#10B981]",
    icon: Bell,
    iconColor: "#2563EB",
    iconBg: "#DBEAFE",
  },
  {
    supportingColor: "text-[#EF4444]",
    icon: ShieldAlert,
    iconColor: "#EF4444",
    iconBg: "#FEE2E2",
  },
  {
    supportingColor: "text-[#F59E0B]",
    icon: TriangleAlert,
    iconColor: "#F59E0B",
    iconBg: "#FEF3C7",
  },
  {
    supportingColor: "text-[#64748B]",
    icon: ShieldCheck,
    iconColor: "#2563EB",
    iconBg: "#DBEAFE",
  },
  {
    supportingColor: "text-[#64748B]",
    icon: Info,
    iconColor: "#10B981",
    iconBg: "#DCFCE7",
  },
  {
    supportingColor: "text-[#64748B]",
    icon: BellOff,
    iconColor: "#64748B",
    iconBg: "#F1F5F9",
  },
];

export const VendorKpiCard = ({ data }) => {
  const kpiData = Array.isArray(data)
    ? data.map((item, index) => ({
        ...(visualConfig[index] ?? visualConfig[0]),
        title: item.metric,
        value: Number(item.value ?? 0).toLocaleString(),
        supporting: "Current period",
        invoiceCount: Number(item.invoiceCount ?? 0).toLocaleString(),
        invoiceValue: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(Number(item.invoiceValue ?? 0)),
      }))
    : [];

  return <KpiCardsGrid items={kpiData} columns="xl:grid-cols-6" variant="vendor" />;
};
