import {
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Shield,
  Percent,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export default function ExecutiveInsightsPanel({ data }) {
  const staticExecutiveInsights = [
    {
      title: "Duplicate Payment Prevention Rate",
      value: "98.7%",
      change: "+2.6%",
      icon: CheckCircle,
      iconColor: "text-emerald-500",
      trend: "up",
    },
    {
      title: "Financial Leakage Identified (USD)",
      value: "$5.61M",
      change: "+17.2%",
      icon: AlertTriangle,
      iconColor: "text-amber-500",
      trend: "up",
    },
    {
      title: "Risk Exposure Trend",
      value: "High",
      change: "+6.3%",
      icon: TrendingUp,
      iconColor: "text-red-500",
      trend: "down",
    },
    {
      title: "Cost Savings Achieved (USD)",
      value: "$4.18M",
      change: "+16.1%",
      icon: Shield,
      iconColor: "text-blue-500",
      trend: "up",
    },
    {
      title: "Return on Investment (ROI)",
      value: "320%",
      change: "+14.5%",
      icon: Percent,
      iconColor: "text-emerald-500",
      trend: "up",
    },
  ];

  const apiInsights = Array.isArray(data) ? data : data?.items;
  const executiveInsights = Array.isArray(apiInsights) && apiInsights.length
    ? staticExecutiveInsights.map((insight, index) => {
        const apiInsight = apiInsights[index];
        if (!apiInsight) {
          return insight;
        }

        const isCurrency = index === 1 || index === 3;
        const isPercentage = index === 0 || index === 4;
        const value = typeof apiInsight.value === "number"
          ? isCurrency
            ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(apiInsight.value)
            : isPercentage
              ? `${apiInsight.value}%`
              : apiInsight.value.toLocaleString()
          : apiInsight.value;

        return {
          ...insight,
          title: apiInsight.metric ?? insight.title,
          value: value ?? insight.value,
          change: `${Number(apiInsight.changePercentage ?? 0) >= 0 ? "+" : ""}${apiInsight.changePercentage ?? 0}%`,
          trend: apiInsight.trend ?? insight.trend,
        };
      })
    : staticExecutiveInsights;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">
          Executive Insights
        </h2>

        <button className="cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-700">
          View full insights
        </button>
      </div>

      <div className="space-y-2">
        {executiveInsights.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-3 hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={18}
                  className={item.iconColor}
                  strokeWidth={2}
                />

                <span className="text-sm font-medium text-slate-700">
                  {item.title}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-800">
                  {item.value}
                </span>

                <div
                  className={`flex items-center gap-1 text-xs font-semibold ${
                    item.trend === "down"
                      ? "text-red-500"
                      : "text-emerald-500"
                  }`}
                >
                  {item.trend === "down" ? (
                    <ArrowDown size={12} />
                  ) : (
                    <ArrowUp size={12} />
                  )}

                  <span>{item.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
