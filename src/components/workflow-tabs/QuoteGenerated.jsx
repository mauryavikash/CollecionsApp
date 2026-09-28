'use client';

import { CircleCheck, Download } from 'lucide-react';
import Card from './Card';
import { formatDateTime } from '@/utils/constants';

export default function QuoteGenerated({ data }) {
    if (!data) return null;

    const formatJson = (jsonString) => {
        try {
            return JSON.stringify(JSON.parse(jsonString), null, 2);
        } catch {
            return jsonString || "{}";
        }
    };

    const handleDownload = () => {
        const blob = new Blob([data.jsonQuote || '{}'], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.quoteId}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <div className="flex items-center justify-between gap-4">
                <div className="text-lg font-semibold">Step 4: Quote Generation</div>
                {data.status === 'success' && (
                    <span className="rounded-full bg-[#e8a030]/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#e8a030]">
                        Completed
                    </span>
                )}
            </div>

            <div className="grid gap-3 md:grid-cols-2  mt-4">
                <Card label="Quote ID" value={data.quoteId} />
                <Card label="Payment Terms" value={data.paymentTerms} />
                <Card label="Generated Date" value={formatDateTime(data.generatedDate)} />
                <Card label="Valid Until" value={formatDateTime(data.validUntil)} />
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-[#2a2f3a] bg-[#0f1319] p-4">
                <span className="flex items-center gap-2">
                    <CircleCheck className="h-4 w-4" />
                    {data.summaryMessage}
                </span>

                <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#16a249] px-4 py-2 text-sm font-medium text-white"
                >
                    <Download className="h-4 w-4" />
                    Download JSON
                </button>
            </div>

            {/* <pre className="mt-4 overflow-auto rounded-2xl bg-[#111318] p-4 text-sm text-[#d1d5db]">
                {data.jsonQuote || '{}'}
            </pre> */}
            <pre className="mt-4 max-h-[500px] overflow-y-auto rounded-2xl bg-[#111318] p-4 text-sm text-[#d1d5db] whitespace-pre-wrap">
                {formatJson(data.jsonQuote)}
            </pre>
        </div>
    );
}