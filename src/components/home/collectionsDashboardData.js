export const collectionsDashboardData = {
  kpis: [
    { id: "total-ar", label: "Total AR", value: "$24.7M", trend: "+3.2%", context: "vs last month", type: "sparkline", values: [7, 16, 11, 28, 21] },
    { id: "overdue", label: "Overdue Amount", value: "$8.3M", trend: "33.6%", context: "of total AR", type: "aging", values: [10, 17, 27, 14, 22], labels: ["1-30d", "31-60d", "61-90d", "91-180d", "181+d"] },
    { id: "risk", label: "High Risk Accounts", value: "5", context: "$2.5M exposure", type: "risk", values: [{ color: "#f2545b", value: 5 }, { color: "#ff9f43", value: 5 }, { color: "#ffd23f", value: 4 }, { color: "#42c980", value: 3 }] },
    { id: "ptp", label: "Promise to Pay (PTP)", value: "5", context: "Weekly PTP trend (Last 7 days)", type: "ptp", active: "Active", broken: 2, values: [8, 18, 29, 10, 10, 18, 23] },
    { id: "recovery", label: "Projected Cash Recovery", value: "$1.82M", secondaryValue: "$6.46M", context: "7-day actual VS 30-day forecast", type: "recovery", values: [8, 8, 19, 7, 17, 23] },
  ],
  forecast: [
    { label: "Wk 1", actual: 980, projected: 1160 },
    { label: "Wk 2", actual: 1040, projected: 1110 },
    { label: "Wk 3", actual: 1160, projected: 1280 },
    { label: "Wk 4", actual: 0, projected: 1080 },
    { label: "M2 W1", actual: 0, projected: 1030 },
    { label: "M2 W2", actual: 0, projected: 1360 },
  ],
  riskAccounts: [
    { score: 94, name: "Omega Systems Ltd", detail: "245 DPD. 181+ days", amount: "$4789k" },
    { score: 87, name: "Pinnacle Healthcare", detail: "178 DPD. 181+ days", amount: "$568k" },
    { score: 82, name: "Vertex Logistics Corp", detail: "132 DPD. 91-180 days", amount: "$423k" },
    { score: 78, name: "Coastal Distribution", detail: "95 DPD. 91-180 days", amount: "$446k" },
  ],
  riskDistribution: [
    { label: "Low Risk", amount: "$5.9M", percentage: 24, color: "#50c878" },
    { label: "Medium Risk", amount: "$6.1M", percentage: 25, color: "#ffd23f" },
    { label: "High Risk", amount: "$6.8M", percentage: 28, color: "#ff9f43" },
    { label: "Critical Risk", amount: "$5.9M", percentage: 23, color: "#f2545b" },
  ],
  collectors: [
    { name: "Sarah Chen", percentage: 84, achieved: "$2.3M", target: "$2.5M", color: "#db7900" },
    { name: "Monica Rodriguez", percentage: 85, achieved: "$1.9M", target: "$2.2M", color: "#db7900" },
    { name: "James Wilson", percentage: 90, achieved: "$1.6M", target: "$1.8M", color: "#12a650" },
    { name: "Mark Davis", percentage: 97, achieved: "$1.4M", target: "$2.0M", color: "#12a650" },
  ],
  ptpActivity: [
    { customer: "Dynamic Solutions Corp", amount: "$180K", promiseDate: "2024-10-23", status: "Paid", owner: "Mark Davis" },
    { customer: "Vertex Technologies", amount: "$324K", promiseDate: "2024-10-05", status: "Active", owner: "James Wilson" },
    { customer: "Acme Manufacturing Ltd", amount: "$180K", promiseDate: "2024-10-15", status: "Active", owner: "Sarah Chen" },
    { customer: "Pinnacle Healthcare", amount: "$260K", promiseDate: "2024-09-30", status: "Pending", owner: "Monica Rodriguez" },
    { customer: "Coastal Distribution", amount: "$200K", promiseDate: "2024-09-21", status: "Broken", owner: "Mark Davis" },
  ],
};