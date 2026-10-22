export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value) {
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(value);
  }

  return value;
}

export function formatCompactCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "-";
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(abs >= 1e10 ? 0 : 1)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(abs >= 1e8 ? 0 : 1)}M`;
  if (abs >= 1e3) return `${sign}$${Math.round(abs / 1e3)}K`;
  return `${sign}$${Math.round(abs)}`;
}

// Parses display amounts such as "$2.1M", "$-99K" or "$717.73K" into numbers.
export function parseCurrency(value) {
  if (typeof value === "number") return value;
  const match = String(value ?? "").replace(/,/g, "").match(/(-?)\$?\s*(-?\d+(?:\.\d+)?)\s*([KMB])?/i);
  if (!match) return 0;
  const multiplier = { K: 1e3, M: 1e6, B: 1e9 }[match[3]?.toUpperCase()] ?? 1;
  const sign = match[1] === "-" || match[2].startsWith("-") ? -1 : 1;
  return sign * Math.abs(Number(match[2])) * multiplier;
}

export function parseISODate(value) {
  if (!value || typeof value !== "string") return null;
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// Whole days from `from` to `to` (positive when `to` is later).
export function daysBetween(from, to) {
  if (!from || !to) return null;
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

export function formatShortDate(value) {
  const date = value instanceof Date ? value : parseISODate(value);
  if (!date) return value || "-";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function getInitials(value = "") {
  return (
    String(value)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("") || "NA"
  );
}

const AVATAR_COLORS = ["#2563eb", "#7c3aed", "#059669", "#0ea5e9", "#db2777", "#ea580c", "#4f46e5"];

export function getAvatarColor(name = "") {
  const hash = [...String(name)].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function percentChange(current, previous) {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}