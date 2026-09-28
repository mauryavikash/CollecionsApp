'use client';

export default function ProductExtracted({ data }) {
    if (!data) return null;

    return (
        <div>
            <div className="flex items-center justify-between gap-4">
                <div className="text-lg font-semibold">Step 3: Product Check</div>
                <span className="rounded-full bg-[#34d399]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#34d399]">
                    Matched
                </span>
            </div>

            <div className="grid gap-3 md:grid-cols-1 mt-4">
                <div className="rounded-xl border border-[#2a2f3a] bg-[#0f1319] p-4">
                    <div className="mb-1 text-[10px] uppercase tracking-[0.32em] text-[#7b8393]">
                        Summary
                    </div>
                    <div className="text-sm font-semibold text-[#e8eaed] break-all">{data.summaryMessage}</div>
                </div>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-[#2a2f3a] bg-[#0f1319] p-4 mt-4">
                <table className="min-w-full text-left text-sm text-[#d1d5db]">
                    <thead>
                        <tr className="text-xs uppercase tracking-[0.24em] text-[#9aa0ad]">
                            <th className="px-4 py-3">Item</th>
                            <th className="px-4 py-3">Description</th>
                            <th className="px-4 py-3">SKU</th>
                            <th className="px-4 py-3">Requested</th>
                            <th className="px-4 py-3">In Stock</th>
                            <th className="px-4 py-3">Lead Time</th>
                            <th className="px-4 py-3">UOM</th>
                            <th className="px-4 py-3">AI Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2f3a]">
                        {data.rows.map((row) => (
                            <tr key={row.item_id}>
                                <td className="px-4 py-4 font-semibold text-[#e8a030]">{row.item_id}</td>
                                <td className="px-4 py-4">{row.description}</td>
                                <td className="px-4 py-4 font-mono">{row.sku}</td>
                                <td className="px-4 py-4 font-mono">{row.quantity_requested}</td>
                                <td className="px-4 py-4 font-mono">{row.quantity_in_stock}</td>
                                <td className="px-4 py-4">{row.lead_time_days} days</td>
                                <td className="px-4 py-4">{row.uom}</td>
                                <td className="px-4 py-4 font-semibold text-[#34d399]">
                                    {row.ai_confidence_score}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}