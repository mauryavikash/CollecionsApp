import { useId } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  ChartColumnIncreasing,
  Coins,
  Handshake,
  Info,
  Users,
} from "lucide-react";

const DEFAULT_TYPES = ["sparkline", "aging", "risk", "ptp", "recovery"];

const BLUE_CARD_BG = "linear-gradient(180deg, #ffffff 0%, #f3f8ff 100%)";

/* Per-KPI theme (icon, tile, value colour, card border/background) from the Figma design */
const THEME = {
  sparkline: {
    Icon: Coins,
    iconBg: "#e3edff",
    iconColor: "#2563eb",
    value: "#0f2a5c",
    border: "#c9dcf7",
    bg: BLUE_CARD_BG,
  },
  aging: {
    Icon: AlertTriangle,
    iconBg: "#fde1e4",
    iconColor: "#e11d48",
    value: "#ef4444",
    border: "#f5b4ba",
    bg: "linear-gradient(180deg, #fff8f8 0%, #ffe9eb 100%)",
  },
  risk: {
    Icon: Users,
    iconBg: "#e3edff",
    iconColor: "#2563eb",
    value: "#f59e0b",
    border: "#c9dcf7",
    bg: BLUE_CARD_BG,
  },
  ptp: {
    Icon: Handshake,
    iconBg: "#d9f4e5",
    iconColor: "#16a34a",
    value: "#16a34a",
    border: "#bde6cd",
    bg: "linear-gradient(180deg, #ffffff 0%, #eefaf3 100%)",
  },
  recovery: {
    Icon: ChartColumnIncreasing,
    iconBg: "#e3edff",
    iconColor: "#2563eb",
    value: "#16a34a",
    border: "#c9dcf7",
    bg: BLUE_CARD_BG,
  },
};

/* Overdue aging buckets 1-30d ... 181+d: green -> red */
const AGING_COLORS = ["#4bc173", "#9bd138", "#ffd12a", "#fb9337", "#f15a63"];

/* PTP weekly segments: older days lighter, recent days darker blue */
const PTP_SEGMENT_COLORS = ["#d3e3fa", "#c3d8f8", "#a9c7f5", "#6f9ff0", "#3f7ee6", "#2563eb", "#1d4fd8"];

/* Scale raw values to bar heights in px (relative to the max value) */
function scaleHeights(values, maxH, minH = 4) {
  const nums = (values ?? []).map((v) => Number(v) || 0);
  if (nums.length === 0) return [];
  const max = Math.max(...nums, 1);
  return nums.map((v) => Math.round(minH + (v / max) * (maxH - minH)));
}

/* Line + filled area for the Total AR sparkline, fitted to a w x h box */
function buildSparkline(values, w = 66, h = 36, pad = 3) {
  const nums = (values ?? []).map((v) => Number(v) || 0);
  if (nums.length < 2) return null;
  const min = Math.min(...nums);
  const range = Math.max(...nums) - min || 1;
  const points = nums.map((v, i) => [
    Number((pad + (i * (w - 2 * pad)) / (nums.length - 1)).toFixed(1)),
    Number((pad + (1 - (v - min) / range) * (h - 2 * pad)).toFixed(1)),
  ]);
  const line = points.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `M${points[0][0]},${h} L${points.map(([x, y]) => `${x},${y}`).join(" L")} L${points[points.length - 1][0]},${h} Z`;
  return { points, line, area };
}

/* Strip the time from a backend label: "As of 17 Sep 2026, 12:00 AM" -> "17 Sep 2026" */
function stripTime(text) {
  if (!text) return null;
  return String(text).replace(/^As of\s*/i, "").split(",")[0].trim() || null;
}

export default function CollectionKpiCard({ kpis = [], asOfDate }) {
  const metrics = (kpis ?? []).map((m, i) => ({
    ...m,
    type: m?.type ?? DEFAULT_TYPES[i] ?? "sparkline",
  }));


  return (
    /* Responsive: 1 col (phone) -> 2 (tablet) -> 3 (laptop 1280px) -> 5 (wide desktop) */
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 min-[1700px]:grid-cols-5">
      {metrics.map((metric, index) => (
        <DashboardKpi
          key={`${metric?.label ?? "kpi"}-${index}`}
          metric={metric}
          asOfDate={asOfDate}
        />
      ))}
    </section>
  );
}

/* KPIs where a decrease is good news (shown in green). */
const LOWER_IS_BETTER = new Set(["sparkline", "aging", "risk"]);

/* Period-over-period change. Prefer changePct (it reconciles with
   value vs previousValue in the API), fall back to the legacy trend field. */
function getTrendText(metric) {
  return metric?.changePct ?? metric?.trend ?? null;
}

/* Is the change going up? Uses changeDirection, else parses the sign. */
function isTrendUp(metric) {
  if (metric?.changeDirection) return metric.changeDirection === "up";
  if (metric?.trendPositive !== undefined) return metric.trendPositive;
  const t = String(getTrendText(metric) ?? "");
  if (t.startsWith("-") || t.startsWith("\u2193")) return false;
  if (t.startsWith("+") || t.startsWith("\u2191")) return true;
  const n = parseFloat(t);
  if (!Number.isNaN(n)) return n >= 0;
  return true;
}

function DashboardKpi({ metric, asOfDate }) {
  const gradientId = `kpi-spark-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const type = metric?.type;
  const theme = THEME[type] ?? THEME.sparkline;
  const Icon = theme.Icon;
  const values = metric?.values ?? [];
  const asOfDay = stripTime(metric?.asOf) || asOfDate;
  const asOfText = asOfDay ? `As of ${asOfDay}` : null;
  const trendText = getTrendText(metric);
  const trendUp = isTrendUp(metric);
  const positive = LOWER_IS_BETTER.has(metric?.type) ? !trendUp : trendUp;
  /* "vs last month" / "vs last week" from the backend */
  const changeLabel =
    metric?.hover?.changeLabel ??
    metric?.changeLabel ??
    (/^vs\b/i.test(String(metric?.context ?? "")) ? metric.context : null);
  const previousValue = metric?.previousValue ?? metric?.hover?.previousValue;
  const previousLabel = metric?.previousLabel ?? metric?.hover?.previousLabel;

  const sparkline = type === "sparkline" ? buildSparkline(values) : null;
  const agingHeights = type === "aging" ? scaleHeights(values, 30, 5) : [];
  const recoveryHeights = type === "recovery" ? scaleHeights(values, 40, 10) : [];
  const recoverySplit = Math.ceil(recoveryHeights.length / 2);
  const period = metric?.period ?? "7 Days";
  const secondaryValue = metric?.secondaryValue ?? metric?.hover?.thirtyDay;
  const secondaryPeriod = metric?.secondaryPeriod ?? "30 Days";
  /* Space reserved on the right for the bottom-right mini chart so text never runs under it */
  const visualGutter =
    type === "recovery" ? "pr-[96px]" : type === "sparkline" ? "pr-[74px]" : type === "aging" ? "pr-[54px]" : "";

  return (
    <article
      className="relative flex min-h-[124px] flex-col overflow-hidden rounded-[12px] border px-3 pb-2.5 pt-3 shadow-[0_2px_6px_rgba(37,99,235,0.08)]"
      style={{ borderColor: theme.border, background: theme.bg }}
    >
      {/* As-of date, top right */}
      {asOfText && (
        <span className="absolute right-3 top-2 z-10 inline-flex items-center gap-1 whitespace-nowrap text-[9px] text-slate-400">
          <CalendarDays size={10} className="shrink-0" />
          {asOfText}
        </span>
      )}

      <div className="relative z-10 flex gap-2.5">
        {/* Icon tile */}
        <div
          className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-[10px]"
          style={{ backgroundColor: theme.iconBg }}
        >
          <Icon size={20} strokeWidth={2.2} style={{ color: theme.iconColor }} />
        </div>

        <div className={`min-w-0 flex-1 pt-2.5 ${visualGutter}`}>
          {/* Title + info */}
          <p className="flex items-center gap-1 text-[12px] font-bold leading-4 text-slate-800">
            {metric?.label}
            <Info size={11} className="shrink-0 text-slate-400" aria-hidden="true" />
          </p>

          {/* Main value */}
          <h3
            className="mt-0.5 break-words text-[20px] font-extrabold leading-[26px] sm:text-[22px]"
            style={{ color: theme.value }}
          >
            {metric?.value}
            {type === "recovery" && period && (
              <span className="ml-1 whitespace-nowrap text-[11px] font-medium text-slate-500">/ {period}</span>
            )}
          </h3>

        {/* Line 1: arrow + % + "vs last month" on a single line */}
        {trendText && (
          <p className="mt-1 flex flex-wrap items-center gap-x-1 text-[10px]">
            <span
              className={`inline-flex items-center gap-0.5 font-bold ${positive ? "text-[#16a34a]" : "text-[#ef4444]"}`}
            >
              {trendUp ? <ArrowUp size={11} strokeWidth={3} /> : <ArrowDown size={11} strokeWidth={3} />}
              {String(trendText).replace(/^[+-]/, "")}
            </span>
            {changeLabel && (
              <span className="font-medium text-slate-500">{changeLabel}</span>
            )}
          </p>
        )}

        {/* Line 2: previous period amount */}
        {previousValue != null && previousValue !== "" && (
          <p className="mt-0.5 text-[10px]">
            <span className="font-semibold text-slate-700">{previousValue}</span>
            {previousLabel && (
              <span className="ml-1 text-slate-500">{previousLabel}</span>
            )}
          </p>
        )}

          {/* Fallback when the backend sends no change data */}
          {!trendText && metric?.context && (
            <p className="text-[10px] text-slate-400">{metric.context}</p>
          )}
        </div>
      </div>

      {/* High Risk: segment dots, bottom right */}
      {type === "risk" && values.length > 0 && (
        <div className="relative z-10 mt-auto flex justify-end gap-2.5 pt-1.5 text-[10px] font-semibold text-slate-700">
          {values.map((risk, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              <i
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: risk?.color }}
              />
              {risk?.value}
            </span>
          ))}
        </div>
      )}

      {/* PTP: Active | Broken + weekly trend segments, bottom right */}
      {type === "ptp" && (
        <div className="relative z-10 mt-auto flex flex-col items-end gap-1 pt-1">
          <p className="whitespace-nowrap text-[10px] font-semibold">
            <span className="text-[#16a34a]">
              {typeof metric?.active === "number" ? `${metric.active} Active` : "Active"}
            </span>
            <span className="mx-1 text-slate-300">|</span>
            <span className="text-[#f59e0b]">
              {metric?.broken != null ? `${metric.broken} Broken` : "Broken"}
            </span>
          </p>
          {values.length > 0 && (
            <div className="flex w-[110px] gap-[3px]" aria-hidden="true">
              {values.map((_, i) => (
                <span
                  key={i}
                  className="h-[5px] flex-1 rounded-full"
                  style={{
                    backgroundColor:
                      PTP_SEGMENT_COLORS[
                        Math.round((i * (PTP_SEGMENT_COLORS.length - 1)) / Math.max(values.length - 1, 1))
                      ],
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Total AR: area sparkline, bottom right */}
      {sparkline && (
        <svg
          className="pointer-events-none absolute bottom-3 right-3 h-[36px] w-[66px]"
          viewBox="0 0 66 36"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={sparkline.area} fill={`url(#${gradientId})`} />
          <polyline
            points={sparkline.line}
            fill="none"
            stroke="#22a05a"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {sparkline.points.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.8" fill="#22a05a" />
          ))}
        </svg>
      )}

      {/* Overdue: aging bars (1-30d ... 181+d), bottom right */}
      {agingHeights.length > 0 && (
        <div
          className="pointer-events-none absolute bottom-3 right-3 flex h-[32px] items-end gap-[3px]"
          aria-hidden="true"
        >
          {agingHeights.map((h, i) => (
            <span
              key={i}
              className="w-[7px] rounded-[2px]"
              style={{ height: `${h}px`, backgroundColor: AGING_COLORS[i % AGING_COLORS.length] }}
            />
          ))}
        </div>
      )}

      {/* Recovery: actual (green) vs projected (blue) bars + 30-day total, bottom right */}
      {recoveryHeights.length > 0 && (
        <div
          className="pointer-events-none absolute bottom-2 right-3 flex flex-col items-end gap-1"
          aria-hidden="true"
        >
          <div className="flex h-[40px] items-end gap-[3px]">
            {recoveryHeights.map((h, i) => (
              <span
                key={i}
                className="w-[7px] rounded-[2px]"
                style={{ height: `${h}px`, backgroundColor: i < recoverySplit ? "#4cc27e" : "#b5d8f7" }}
              />
            ))}
          </div>
          {secondaryValue && (
            <p className="whitespace-nowrap text-[9px] font-bold text-slate-800">
              {secondaryValue}
              <span className="ml-0.5 font-medium text-slate-500">/ {secondaryPeriod}</span>
            </p>
          )}
        </div>
      )}
    </article>
  );
}
