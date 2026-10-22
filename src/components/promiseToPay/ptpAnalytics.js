import {
  daysBetween,
  formatCompactCurrency,
  getAvatarColor,
  getInitials,
  parseISODate,
  percentChange,
  startOfToday,
} from "@/utils/helpers";

export const PTP_TABS = ["All", "Active", "Partial", "Due Soon", "Broken", "Fulfilled"];
export const DUE_SOON_DAYS = 7;

const AGING_LABELS = {
  current: "Current",
  "30-jan": "1-30 Days",
  "1-30": "1-30 Days",
  "0-30": "1-30 Days",
  "31-60": "31-60 Days",
  "61-90": "61-90 Days",
  "91-180": "91-180 Days",
  "180+": "180+ Days",
  "181+": "180+ Days",
};

function normalizeAgingBucket(value) {
  const key = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s*days?$/, "");
  return AGING_LABELS[key] ?? (value || "-");
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function normalizePtpRecords(source = [], today = startOfToday()) {
  return source.map((record, index) => {
    const status = String(record?.status ?? "Active").trim() || "Active";
    const promise = parseISODate(record?.promiseDate);
    const daysToPromise = promise ? daysBetween(today, promise) : null;
    const isDueSoon =
      status.toLowerCase() === "active" &&
      daysToPromise !== null &&
      daysToPromise >= 0 &&
      daysToPromise <= DUE_SOON_DAYS;
    const owner = record?.owner ?? record?.collectionOwner ?? "";

    return {
      key: `${record?.id ?? "na"}-${record?.invoice ?? index}`,
      id: record?.id,
      customer: record?.customer || "-",
      invoice: record?.invoice || "-",
      amount: record?.amount || formatCompactCurrency(record?.amountRaw),
      amountRaw: Number(record?.amountRaw) || 0,
      created: record?.created || record?.creationDate || "",
      promiseDate: record?.promiseDate || "",
      promise,
      dueDate: record?.dueDate || "",
      followUp: record?.followUp || "",
      status,
      statusKey: status.toLowerCase(),
      isDueSoon,
      daysToPromise,
      agingBucket: normalizeAgingBucket(record?.agingBucket),
      owner: owner || "Unassigned",
      initials: record?.initials || getInitials(owner),
      avatarColor: getAvatarColor(owner),
      note: record?.note || "",
      region: record?.region || "",
    };
  });
}

export function matchesTab(record, tab) {
  if (tab === "All") return true;
  if (tab === "Due Soon") return record.isDueSoon;
  return record.statusKey === tab.toLowerCase();
}

export function countByTab(records) {
  return PTP_TABS.map((label) => ({
    label,
    count: records.filter((record) => matchesTab(record, label)).length,
  }));
}

export function getPeriodMonths(period, today = startOfToday()) {
  return Array.from({ length: period }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (period - 1 - index), 1);
    return {
      key: monthKey(date),
      label: date.toLocaleDateString("en-US", { month: "short" }),
      fullLabel: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    };
  });
}

function rate(kept, total) {
  return total ? Math.round((kept / total) * 100) : 0;
}

function isKept(record) {
  return record.statusKey === "fulfilled" || record.statusKey === "partial";
}

function lastTwoChange(series) {
  if (series.length < 2) return null;
  return percentChange(series[series.length - 1], series[series.length - 2]);
}

export function buildPtpAnalytics(records, period, today = startOfToday()) {
  const months = getPeriodMonths(period, today);
  const monthIndex = new Map(months.map((month, index) => [month.key, index]));
  const empty = () => months.map(() => 0);
  const series = {
    total: empty(),
    kept: empty(),
    fulfilled: empty(),
    partial: empty(),
    active: empty(),
    broken: empty(),
    amount: empty(),
  };

  records.forEach((record) => {
    if (!record.promise) return;
    const index = monthIndex.get(monthKey(record.promise));
    if (index === undefined) return;
    series.total[index] += 1;
    series.amount[index] += record.amountRaw;
    if (isKept(record)) series.kept[index] += 1;
    if (series[record.statusKey]) series[record.statusKey][index] += 1;
  });

  const total = records.length;
  const count = (predicate) => records.filter(predicate).length;
  const fulfilled = count((record) => record.statusKey === "fulfilled");
  const partial = count((record) => record.statusKey === "partial");
  const broken = count((record) => record.statusKey === "broken");
  const dueSoon = count((record) => record.isDueSoon);
  const active = count((record) => record.statusKey === "active");
  const totalAmount = records.reduce((sum, record) => sum + record.amountRaw, 0);
  const shareOf = (value) => (total ? `${((value / total) * 100).toFixed(1)}% of total` : "0% of total");

  const kpis = [
    {
      id: "total",
      label: "Total PTP",
      value: total.toLocaleString("en-US"),
      change: lastTwoChange(series.total),
      comparison: "vs last month",
      spark: series.total,
    },
    {
      id: "fulfilled",
      label: "Fulfilled",
      value: fulfilled.toLocaleString("en-US"),
      change: lastTwoChange(series.fulfilled),
      comparison: shareOf(fulfilled),
      spark: series.fulfilled,
    },
    {
      id: "dueSoon",
      label: "Due Soon",
      value: dueSoon.toLocaleString("en-US"),
      change: null,
      comparison: shareOf(dueSoon),
      spark: series.active,
    },
    {
      id: "partial",
      label: "Partial",
      value: partial.toLocaleString("en-US"),
      change: lastTwoChange(series.partial),
      comparison: shareOf(partial),
      spark: series.partial,
    },
    {
      id: "broken",
      label: "Broken",
      value: broken.toLocaleString("en-US"),
      change: lastTwoChange(series.broken),
      comparison: shareOf(broken),
      spark: series.broken,
      higherIsWorse: true,
    },
    {
      id: "amount",
      label: "Total PTP Amount",
      value: formatCompactCurrency(totalAmount),
      change: lastTwoChange(series.amount),
      comparison: "vs last month",
      spark: series.amount,
    },
  ];

  const trend = months.map((month, index) => ({
    month: month.label,
    fullLabel: month.fullLabel,
    totalPtp: series.total[index],
    ptpKept: series.kept[index],
    active: series.active[index],
    ptpBroken: series.broken[index],
  }));

  const fulfillmentTrend = months.map((month, index) => ({
    month: month.label,
    fullLabel: month.fullLabel,
    rate: rate(series.kept[index], series.total[index]),
  }));

  const statusDistribution = [
    { label: "Fulfilled", value: fulfilled, color: "#16a34a" },
    { label: "Active", value: active - dueSoon, color: "#3b82f6" },
    { label: "Due Soon", value: dueSoon, color: "#f59e0b" },
    { label: "Partial", value: partial, color: "#8b5cf6" },
    { label: "Broken", value: broken, color: "#ef4444" },
  ].map((item) => ({ ...item, pct: total ? Number(((item.value / total) * 100).toFixed(1)) : 0 }));

  const agingBuckets = [
    { label: "Due Today", min: 0, max: 0, color: "#ef1c24" },
    { label: "1-7 Days", min: 1, max: 7, color: "#fb7d0f" },
    { label: "8-14 Days", min: 8, max: 14, color: "#fbbf24" },
    { label: "15-30 Days", min: 15, max: 30, color: "#1d4ed8" },
    { label: "> 30 Days", min: 31, max: Infinity, color: "#7c3aed" },
  ];
  const openRecords = records.filter((record) => record.statusKey !== "fulfilled" && record.daysToPromise !== null);
  const aging = agingBuckets.map((bucket) => ({
    label: bucket.label,
    color: bucket.color,
    value: openRecords.filter((record) => {
      const overdue = -record.daysToPromise;
      return overdue >= bucket.min && overdue <= bucket.max;
    }).length,
  }));

  const collectorMap = new Map();
  records.forEach((record) => {
    if (!record.owner || record.owner === "Unassigned") return;
    const entry = collectorMap.get(record.owner) ?? {
      name: record.owner,
      initials: record.initials,
      color: record.avatarColor,
      total: 0,
      kept: 0,
    };
    entry.total += 1;
    if (isKept(record)) entry.kept += 1;
    collectorMap.set(record.owner, entry);
  });
  const topCollectors = [...collectorMap.values()]
    .map((entry) => ({ ...entry, rate: rate(entry.kept, entry.total) }))
    .sort((a, b) => b.kept - a.kept)
    .slice(0, 5);

  return { kpis, trend, fulfillmentTrend, statusDistribution, aging, topCollectors, total };
}

// ── Backend /ui/ptp-analytics → the same shape buildPtpAnalytics() returns ──

const BACKEND_KPI_IDS = {
  "total-ptp": "total",
  fulfilled: "fulfilled",
  "due-soon": "dueSoon",
  partial: "partial",
  broken: "broken",
  "total-amount": "amount",
};

const BACKEND_AGING_COLORS = {
  overdue: "#b91c1c",
  today: "#ef1c24",
  "1-7": "#fb7d0f",
  "8-14": "#fbbf24",
  "15-30": "#1d4ed8",
  "30+": "#7c3aed",
};

function finiteOrNull(value) {
  const number = Number(value);
  return value === null || value === undefined || !Number.isFinite(number) ? null : number;
}

// "↑ 12.4% vs last 5 months avg" → "vs last 5 months avg"
function comparisonText(kpi) {
  const text = String(kpi?.changeText ?? "").trim();
  if (kpi?.changePct === null || kpi?.changePct === undefined) return text;
  const stripped = text.replace(/^[\u2191\u2193\u2192]?\s*-?[\d.]+%\s*/, "");
  return stripped || "vs last month";
}

export function mapBackendPtpAnalytics(response = {}) {
  const kpis = (response.kpis ?? []).map((kpi) => ({
    id: BACKEND_KPI_IDS[kpi.id] ?? kpi.id,
    label: kpi.label,
    value: kpi.value,
    change: finiteOrNull(kpi.changePct),
    sentiment: kpi.sentiment,
    comparison: comparisonText(kpi),
    pctOfTotal: kpi.pctOfTotal,
    definition: kpi.definition,
    spark: (kpi.sparkline ?? []).map(Number),
    sparkLabels: kpi.sparklineLabels ?? [],
    higherIsWorse: kpi.id === "broken",
  }));

  const fullLabel = (point) => {
    const date = parseISODate(`${point.month}-01`);
    return date ? date.toLocaleDateString("en-US", { month: "short", year: "numeric" }) : point.label;
  };

  const trend = (response.trend?.points ?? []).map((point) => ({
    month: point.label,
    fullLabel: fullLabel(point),
    totalPtp: point.total ?? 0,
    ptpKept: point.fulfilled ?? 0,
    active: point.open ?? 0,
    partial: point.partial ?? 0,
    ptpBroken: point.broken ?? 0,
  }));

  const fulfillmentTrend = (response.fulfillmentTrend?.points ?? []).map((point) => ({
    month: point.label,
    fullLabel: fullLabel(point),
    rate: point.rate ?? 0,
    fulfilled: point.fulfilled,
    total: point.total,
  }));

  const statusDistribution = (response.statusDistribution?.items ?? []).map((item) => ({
    label: item.label,
    value: item.count ?? 0,
    color: item.color,
    pct: item.pct ?? 0,
  }));

  const aging = (response.aging?.buckets ?? []).map((bucket) => ({
    key: bucket.key,
    label: bucket.label,
    value: bucket.count ?? 0,
    amount: bucket.amount,
    color: BACKEND_AGING_COLORS[bucket.key] ?? "#64748b",
  }));

  const topCollectors = (response.topCollectors?.rows ?? []).map((row) => ({
    name: row.collector,
    initials: row.initials || getInitials(row.collector),
    color: getAvatarColor(row.collector),
    total: row.totalPtp ?? 0,
    kept: row.ptpKept ?? 0,
    rate: row.fulfillmentRate ?? 0,
  }));

  return {
    kpis,
    trend,
    fulfillmentTrend,
    statusDistribution,
    aging,
    topCollectors,
    total: response.statusDistribution?.total ?? 0,
    titles: {
      trend: response.trend?.title,
      statusDistribution: response.statusDistribution?.title,
      aging: response.aging?.title,
      fulfillmentTrend: response.fulfillmentTrend?.title,
      topCollectors: response.topCollectors?.title,
    },
    asOfLabel: response.asOfLabel,
    period: response.period,
    window: response.window,
    filters: response.filters,
    source: "backend",
  };
}
