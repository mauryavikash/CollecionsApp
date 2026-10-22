import { useId } from "react";

function toNumbers(values = []) {
  return values.map((value) => Number(value)).filter((value) => Number.isFinite(value));
}

export function Sparkline({ values = [], color = "#2563eb", width = 90, height = 34, fill = true }) {
  const id = useId();
  const points = toNumbers(values);

  if (points.length < 2) {
    return <svg width={width} height={height} aria-hidden="true" />;
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = width / (points.length - 1);
  const coords = points.map((value, index) => [
    index * step,
    height - 3 - ((value - min) / range) * (height - 6),
  ]);
  const line = coords.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${id})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function MiniBars({ values = [], color = "#2563eb", width = 44, height = 34 }) {
  const points = toNumbers(values).map((value) => Math.max(value, 0));

  if (!points.length) {
    return <svg width={width} height={height} aria-hidden="true" />;
  }

  const max = Math.max(...points) || 1;
  const gap = 3;
  const barWidth = Math.max(3, (width - gap * (points.length - 1)) / points.length);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      {points.map((value, index) => {
        const barHeight = Math.max(2, (value / max) * height);
        return (
          <rect
            key={index}
            x={index * (barWidth + gap)}
            y={height - barHeight}
            width={barWidth}
            height={barHeight}
            rx="1.5"
            fill={color}
            opacity={0.45 + (0.55 * (index + 1)) / points.length}
          />
        );
      })}
    </svg>
  );
}
