export default function WorkbenchKpis({ summary = [] }) {
  return (
    <section className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {summary.map((item) => (
        <article key={item.label} className="flex h-[49px] items-center justify-between rounded-[10px] border-2 border-[#2659c7] border-b-[#12c6c9] bg-white px-2.5 shadow-sm">
          <p className="text-[10px] font-semibold text-slate-500">{item.label}</p>
          <b className={`text-[20px] ${item.color}`}>{item.value}</b>
        </article>
      ))}
    </section>
  );
}