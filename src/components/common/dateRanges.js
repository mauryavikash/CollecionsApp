export const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function parseIsoDate(iso) {
  if (!iso) return null;
  const date = new Date(String(iso).length === 10 ? `${iso}T00:00:00Z` : iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function addDays(date, days) {
  return new Date(date.getTime() + days * 86400000);
}

export function formatDay(date, withYear = false) {
  const text = `${date.getUTCDate()} ${MONTHS_SHORT[date.getUTCMonth()]}`;
  return withYear ? `${text} ${date.getUTCFullYear()}` : text;
}

/* "17 Sep – 23 Sep 2026" (both years shown when the range crosses a year). */
export function formatRange(start, end) {
  if (start.getUTCFullYear() !== end.getUTCFullYear()) {
    return `${formatDay(start, true)} – ${formatDay(end, true)}`;
  }
  return `${formatDay(start)} – ${formatDay(end, true)}`;
}

/* Forecast week i covers 7 days starting at the as-of date + 7·i. */
export function forecastWeekRange(asOfIso, index) {
  const start = parseIsoDate(asOfIso);
  if (!start) return null;
  const weekStart = addDays(start, index * 7);
  return formatRange(weekStart, addDays(weekStart, 6));
}

export function formatCompactMoney(raw, digits = 1) {
  const value = Number(raw);
  if (!Number.isFinite(value)) return "-";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(digits)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(digits)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(digits)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

/* "$198.9M" -> 198900000, "1,234" -> 1234, numbers pass through. */
export function parseMoney(input) {
  if (input == null || input === "") return null;
  if (typeof input === "number") return Number.isFinite(input) ? input : null;
  const match = String(input).replace(/,/g, "").match(/(-?\d+(?:\.\d+)?)\s*([KMB])?/i);
  if (!match) return null;
  const scale = { K: 1e3, M: 1e6, B: 1e9 }[match[2]?.toUpperCase()] ?? 1;
  return Number(match[1]) * scale;
}

function toFinite(input) {
  if (input == null || input === "") return null;
  const value = Number(input);
  return Number.isFinite(value) ? value : null;
}

/* Month labels ending at the metric's month: ["May 2026", …, "Sep 2026"].
   Uses the first month in comparisonLabel ("Sep 2026 vs Aug 2026") when present, else the as-of date. */
export function trendMonthLabels(metric, asOfIso, count) {
  const fromLabel = String(metric?.comparisonLabel ?? "").match(/\b([A-Z][a-z]{2})[a-z]*\s+(\d{4})\b/);
  let endYear;
  let endMonth;
  if (fromLabel && MONTHS_SHORT.includes(fromLabel[1])) {
    endYear = Number(fromLabel[2]);
    endMonth = MONTHS_SHORT.indexOf(fromLabel[1]);
  } else {
    const end = parseIsoDate(asOfIso);
    if (!end) return Array.from({ length: count }, (_, index) => `Month ${index + 1}`);
    endYear = end.getUTCFullYear();
    endMonth = end.getUTCMonth();
  }
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(endYear, endMonth - (count - 1 - index), 1));
    return `${MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  });
}

/* Chart points for a money trend line. The API's `values` can be a relative index
   (e.g. 24 while Total AR is $198.9M), so the tooltip shows real amounts:
   1. explicit raw amounts from the API (valuesRaw / amountsRaw / amounts), else
   2. values that already equal the current amount, else
   3. the index scaled by current amount / last index, only when the scaled
      previous point matches the API's previous-month amount (within 10%), else
   4. the API's current and previous amounts on the last two points only. */
export function moneyTrendPoints(metric, asOfIso) {
  const values = Array.isArray(metric?.values) ? metric.values.map(Number).filter(Number.isFinite) : [];
  const count = values.length;
  if (!count) return [];

  const labels = Array.isArray(metric?.labels) && metric.labels.length === count
    ? metric.labels
    : trendMonthLabels(metric, asOfIso, count);
  const current = toFinite(metric?.valueRaw) ?? parseMoney(metric?.value);
  const previous = toFinite(metric?.previousValueRaw) ?? parseMoney(metric?.previousValue ?? metric?.hover?.previousValue);

  let amounts = null;
  const explicit = metric?.valuesRaw ?? metric?.amountsRaw ?? metric?.amounts;
  if (Array.isArray(explicit) && explicit.length === count && explicit.every((v) => Number.isFinite(Number(v)))) {
    amounts = explicit.map(Number);
  } else if (current != null && current !== 0 && Math.abs(values[count - 1] - current) / Math.abs(current) <= 0.01) {
    amounts = values;
  } else if (current != null && previous != null && count >= 2 && values[count - 1] > 0 && previous !== 0) {
    const factor = current / values[count - 1];
    if (Math.abs(values[count - 2] * factor - previous) / Math.abs(previous) <= 0.1) {
      amounts = values.map((value) => value * factor);
    }
  }

  return values.map((value, index) => {
    let display;
    if (amounts) display = formatCompactMoney(amounts[index]);
    else if (index === count - 1 && current != null) display = formatCompactMoney(current);
    else if (index === count - 2 && previous != null) display = formatCompactMoney(previous);
    else display = "Amount not available";
    return { label: labels[index], value, display };
  });
}
