import React from 'react';

export default function AIInsights() {
  return (
    <div className="border border-slate-200 rounded-lg p-5 bg-gradient-to-b from-white to-slate-50/50 space-y-4">
      <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm">
        <span>✨</span> <h2>AI Insights</h2>
      </div>
      <div className="space-y-3 text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-3">
          <span className="text-amber-500 text-sm">⚠️</span>
          <p>10 items need your attention</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-emerald-500 text-sm">📈</span>
          <p>6 items have high confidence recommendations</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-blue-500 text-sm">ℹ️</span>
          <p>3 payments are pending supplier confirmation</p>
        </div>
      </div>
      <div className="pt-2 flex justify-end">
        <button className="bg-[#0b57d0] hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-5 rounded-md flex items-center gap-2 shadow-sm transition-all">
          View All Insights <span>›</span>
        </button>
      </div>
    </div>
  );
}
