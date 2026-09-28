'use client';

import { Mail } from 'lucide-react';
import PdfPreview from './PdfPreview';
import Card from './Card';
import { formatDateTime } from '@/utils/constants';

export default function QuoteSent({ data }) {
    if (!data) return null;

    // const attachment = data.attachments?.[0];
    // const htmlContent = data.bodyContent;
    // console.log('QuoteSent data:', data.bodyContent);
    return (
        <div>
            <div className="flex items-center justify-between gap-4">
                <div className="text-lg font-semibold">Step 5: Quote Sent</div>
                {data.status === 'success' && (
                    <span className="rounded-full bg-[#e8a030]/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#e8a030]">
                        Sent
                    </span>
                )}

            </div>

            <div className="grid gap-3 md:grid-cols-2  mt-4">
                <Card label="To" value={data.to} />
                <Card label="Sent At" value={formatDateTime(data.sentAt)} />
                <Card label="Subject" value={data.subject} />
                <Card label="Status" value="Email Sent" />
            </div>

            <div className="rounded-3xl border border-[#2a2f3a] bg-[#0f1319] p-5 mt-4">
                <div className="text-sm font-semibold text-[#e8eaed] break-all">Email Content Preview</div>
                <p className="mt-3 text-sm leading-7 text-[#d1d5db] whitespace-pre-line">
                    {data.bodyContent}

                </p>

                <div className="mt-4 rounded-2xl border border-[#2a2f3a] bg-[#111318] p-4 text-sm text-[#9aa0ad]">
                    <div className="font-semibold text-[#e8eaed]">Attachments</div>

                    {data.attachments?.length ? (
                        <div className="mt-2 space-y-2">
                            {data.attachments.map((attachment, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 shrink-0" />
                                    <span className="break-words">{attachment.file_name}</span>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>

            {/* {attachment?.download_url ? (
                <PdfPreview pdfUrl={attachment.download_url} title="Attachment Preview" />
            ) : null} */}

            {data.attachments?.length ? (
                data.attachments.map((attachment, index) => (
                    <div key={index} className="mb-4">
                        {attachment.content_base64 ? (
                            <PdfPreview
                                pdfUrl={`data:application/pdf;base64,${attachment.content_base64}`}
                                title={attachment.file_name || "Attachment Preview"}
                            />
                        ) : attachment.download_url ? (
                            <PdfPreview
                                pdfUrl={attachment.download_url}
                                title={attachment.file_name || "Attachment Preview"}
                            />
                        ) : null}
                    </div>
                ))
            ) : null}

        </div>
    );
}