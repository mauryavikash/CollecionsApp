"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function readUserName() {
  try {
    const stored = sessionStorage.getItem("user");
    if (!stored || stored === "undefined") return "";
    const user = JSON.parse(stored);
    return user?.name || user?.username || "";
  } catch {
    return "";
  }
}

/* Page welcome banner with a soft shimmer; the page title itself lives in the header. */
export default function WelcomeBanner({ description, dateLabel, actions }) {
  const name = useSyncExternalStore(subscribe, readUserName, () => "");

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white px-6 py-5 shadow-sm"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgb(240, 247, 255) 0%, rgb(255, 255, 255) 50%, rgb(240, 253, 244) 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: "linear-gradient(105deg, transparent 40%, rgba(59, 130, 246, 0.07) 50%, transparent 60%)",
          animation: "3.5s ease-in-out 0s infinite normal none running welcomeShimmer",
        }}
      />
      <style>{`
        @keyframes welcomeShimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
      <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Welcome back{name ? `, ${name}` : ""}!</h2>
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {dateLabel && (
            <div className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-slate-500">
              <span className="text-slate-400">📅</span>
              {dateLabel}
            </div>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
}
