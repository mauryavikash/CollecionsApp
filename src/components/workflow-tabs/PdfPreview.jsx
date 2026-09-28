'use client';

import React from 'react';

export default function PdfPreview({ pdfUrl, title = 'Attachment Preview' }) {
    return (
        <div className="rounded-3xl border border-[#2a2f3a] bg-[#0f1319] p-4">
            <div className="mb-3 flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-[#e8eaed] break-all">{title}</div>

                <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-[#e8a030] hover:underline"
                >
                    Open PDF
                </a>
            </div>

            <div className="h-[500px] overflow-hidden rounded-2xl border border-[#2a2f3a] bg-[#111318]">
                <iframe
                    src={pdfUrl}
                    title="PDF Preview"
                    className="h-full w-full"
                />
            </div>

            <div className="mt-3 text-xs text-[#9aa0ad]">
                If the browser cannot preview the PDF, use “Open PDF”.
            </div>
        </div>
    );
}