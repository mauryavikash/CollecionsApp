import { formatCompactCurrency, parseCurrency, parseISODate } from "@/utils/helpers";

export const AGING_BUCKETS = [
  { key: "current", label: "Current (0-30d)", short: "1-30d", aliases: ["0-30d", "1-30d", "current"], color: "#16a34a" },
  { key: "31-60", label: "31-60d", short: "31-60d", aliases: ["31-60d"], color: "#f59e0b" },
  { key: "61-90", label: "61-90d", short: "61-90d", aliases: ["61-90d"], color: "#f97316" },
  { key: "91-180", label: "91-180d", short: "91-180d", aliases: ["91-180d"], color: "#ea580c" },
  { key: "181+", label: "181+d", short: "181+d", aliases: ["181+d", "181+", "181+ days"], color: "#dc2626" },
];

export function getMetric(account, keyword) {
  return (account?.metrics ?? []).find((metric) => String(metric?.label ?? "").toLowerCase().includes(keyword));
}

export function buildAging(aging = [], totalAr = 0) {
  return AGING_BUCKETS.map((bucket) => {
    const source = aging.find((item) => bucket.aliases.includes(String(item?.label ?? "").trim().toLowerCase()));
    const percent = Number(source?.percent) || 0;
    const amountRaw = Number.isFinite(Number(source?.amountRaw)) && source?.amountRaw != null
      ? Number(source.amountRaw)
      : source?.amount != null
        ? parseCurrency(source.amount)
        : (percent / 100) * totalAr;
    return { ...bucket, percent, amountRaw, amount: formatCompactCurrency(amountRaw) };
  });
}

function parseDays(value) {
  const match = String(value ?? "").match(/-?\d+/);
  return match ? Number(match[0]) : 0;
}

export function normalizeTransactions(transactions = []) {
  return transactions.map((item, index) => {
    const status = item?.status || "-";
    const invoice = item?.invoiceNumber || item?.invoice || "-";
    const ageDays = Number(item?.ageDays);
    const amountRaw = Number(item?.amountRaw);
    return {
      key: `${invoice}-${index}`,
      invoice,
      date: item?.invoiceDate || item?.date || "",
      due: item?.dueDate || item?.due || "",
      ageDays: status === "Paid" ? 0 : Number.isFinite(ageDays) ? ageDays : parseDays(item?.days),
      amount: item?.amount || "-",
      amountRaw: Number.isFinite(amountRaw) ? amountRaw : parseCurrency(item?.amount),
      status,
      statusColor: item?.statusColor,
      paymentDate: item?.paymentDate || "",
    };
  });
}

export function monthlyCounts(history = [], status, months = 6, today = new Date()) {
  const counts = Array.from({ length: months }, () => 0);
  history.forEach((item) => {
    if (String(item?.status ?? "").toLowerCase() !== status) return;
    const created = parseISODate(item?.promiseDate ?? item?.created);
    if (!created) return;
    const offset = (today.getFullYear() - created.getFullYear()) * 12 + today.getMonth() - created.getMonth();
    if (offset >= 0 && offset < months) counts[months - 1 - offset] += 1;
  });
  return counts;
}
