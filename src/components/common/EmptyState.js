export function EmptyState({ title, description }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div className="text-base font-semibold text-slate-900">{title}</div>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
    </div>
  );
}