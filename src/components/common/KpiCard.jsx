"use client";

import { useId } from "react";
import { Area, AreaChart, Bar, BarChart, Cell, Tooltip, XAxis } from "recharts";

export const KPI_CARD_BORDER_STYLE = {
  borderWidth: "1.5px",
  borderStyle: "solid",
  borderColor: "transparent",
  backgroundImage:
    "linear-gradient(white, white), linear-gradient(135deg, rgb(30, 58, 138) 0%, rgb(59, 130, 246) 55%, rgb(16, 185, 129) 100%)",
  backgroundOrigin: "border-box",
  backgroundClip: "padding-box, border-box",
};

const CHART_STYLE = { width: "100%", height: "100%" };

/* "+12.2%" / -5.6 / "↓ 4.8%" -> { text: "12.2%", up: true } */
export function parseChange(value, direction) {
  if (value === null || value === undefined || value === "") return null;
  const raw = String(value).trim();
  const number = parseFloat(raw.replace(/[^0-9.+-]/g, ""));
  if (!Number.isFinite(number)) return null;
  let up = number >= 0;
  if (direction === "up") up = true;
  if (direction === "down") up = false;
  if (raw.startsWith("\u2193")) up = false;
  return { text: `${Math.abs(number).toFixed(1)}%`, up };
}

function MiniTooltip({ active, payload, formatValue, color }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload ?? {};
  return (
    <div className="pointer-events-none whitespace-nowrap rounded-lg border border-slate-100 bg-white/95 px-2.5 py-1.5 text-[11px] shadow-lg backdrop-blur">
      {point.label && <div className="font-medium text-slate-500">{point.label}</div>}
      <div className="flex items-center gap-1.5 font-bold text-slate-900">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: point.color ?? color }} />
        {point.display ?? (formatValue ? formatValue(point.value) : point.value)}
      </div>
      {point.note && <div className="text-[10px] text-slate-400">{point.note}</div>}
    </div>
  );
}

/* Interactive mini chart: hover shows the point/bar value with a highlight. */
export function KpiMiniChart({ type = "area", data = [], color = "#2563eb", height = 48, formatValue }) {
  const gradientId = `kpi-area-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const points = (data ?? []).filter((point) => Number.isFinite(Number(point?.value)));
  if (points.length < 2 && type === "area") return null;
  if (!points.length) return null;

  const tooltip = (
    <Tooltip
      content={<MiniTooltip formatValue={formatValue} color={color} />}
      cursor={type === "bar" ? { fill: "rgba(148, 163, 184, 0.15)", radius: 3 } : { stroke: color, strokeOpacity: 0.35, strokeDasharray: "3 3" }}
      allowEscapeViewBox={{ x: true, y: true }}
      wrapperStyle={{ zIndex: 1000, outline: "none" }}
      offset={10}
      isAnimationActive={false}
    />
  );

  return (
    <div className="mt-3 w-full" style={{ height }}>
        {type === "bar" ? (
          <BarChart responsive style={CHART_STYLE} data={points} margin={{ top: 2, right: 0, bottom: 0, left: 0 }} barCategoryGap="18%">
            <XAxis dataKey="label" hide />
            {tooltip}
            <Bar
              dataKey="value"
              radius={[3, 3, 0, 0]}
              minPointSize={2}
              activeBar={{ fillOpacity: 1, stroke: "#0f172a", strokeOpacity: 0.15, strokeWidth: 1 }}
              isAnimationActive
              animationDuration={600}
            >
              {points.map((point, index) => (
                <Cell key={index} fill={point.color ?? color} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <AreaChart responsive style={CHART_STYLE} data={points} margin={{ top: 4, right: 4, bottom: 2, left: 4 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" hide />
            {tooltip}
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4, fill: "#fff", stroke: color, strokeWidth: 2 }}
              isAnimationActive
              animationDuration={600}
            />
          </AreaChart>
        )}
    </div>
  );
}

/*
 * Shared KPI card: gradient border, lift on hover, top-right icon tile,
 * change pill, comparison text and an optional interactive mini chart.
 */
export default function KpiCard({
  label,
  value,
  valueSuffix,
  icon: Icon,
  accent = "#0b57d0",
  change,
  changePositive,
  changeLabel,
  footnote,
  extra,
  chart,
  title,
  dateLabel,
  badge,
  className = "",
}) {
  const parsed = change && typeof change === "object" ? change : parseChange(change);
  const positive = changePositive ?? parsed?.up ?? true;

  return (
    <div
      title={title}
      className={`@container group relative z-10 flex h-full min-w-0 flex-col rounded-xl bg-white p-3 shadow-sm transition-all duration-300 hover:z-[999] hover:-translate-y-0.5 hover:shadow-lg 2xl:p-4 ${className}`}
      style={KPI_CARD_BORDER_STYLE}
    >
      {/* Font sizes follow the card width so 4, 5 or 6 cards per row all stay readable. */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[11px] font-semibold tracking-tight text-slate-500 @min-[160px]:text-xs">{label}</div>
          {dateLabel && <div className="mt-0.5 truncate text-[10px] font-medium text-slate-400">{dateLabel}</div>}
          <div className="mt-1.5 break-words text-lg font-bold leading-none tracking-tight text-slate-900 @min-[140px]:text-xl @min-[160px]:text-2xl">
            {value ?? "-"}
            {valueSuffix && <span className="ml-1 text-[11px] font-medium text-slate-500 @min-[160px]:text-xs">{valueSuffix}</span>}
          </div>
        </div>
        {Icon && (
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-105 @min-[160px]:h-9 @min-[160px]:w-9"
            style={{ backgroundColor: `${accent}1a` }}
          >
            <Icon className="h-3.5 w-3.5 @min-[160px]:h-[18px] @min-[160px]:w-[18px]" style={{ color: accent }} aria-hidden="true" />
          </div>
        )}
      </div>

      {(parsed || changeLabel || badge) && (
        <div className="mt-2 flex flex-wrap items-center gap-1 text-[10px] font-medium @min-[160px]:gap-1.5 @min-[160px]:text-[11px]">
          {parsed && (
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-bold ${
                positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              }`}
            >
              {parsed.up ? "\u2191" : "\u2193"} {parsed.text}
            </span>
          )}
          {changeLabel && <span className="text-slate-500">{changeLabel}</span>}
          {badge && (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">{badge}</span>
          )}
        </div>
      )}

      {extra}

      {chart && <KpiMiniChart {...chart} />}

      {footnote && <div className="mt-auto pt-2 text-[10px] text-slate-400 @min-[160px]:text-[11px]">{footnote}</div>}
    </div>
  );
}
