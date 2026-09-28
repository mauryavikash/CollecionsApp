export default function Card({ label, value, valueClass = 'text-[#e8eaed]' }) {
    return (
        <div className="rounded-xl border border-[#2a2f3a] bg-[#111318] p-4">
            <div className="mb-1 text-[10px] uppercase tracking-[0.32em] text-[#7b8393]">
                {label}
            </div>
            <div className={`text-sm font-semibold break-all ${valueClass}`}>{value}</div>
        </div>
    );
}