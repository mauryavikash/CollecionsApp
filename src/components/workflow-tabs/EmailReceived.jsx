'use client';

import Card from './Card';
import PdfPreview from './PdfPreview';


export default function EmailReceived({ data }) {
    if (!data) return null;

    // const attachment = data.attachments?.[0];

    const attachment = data.attachments?.find(
        (file) => !file.file_name?.toLowerCase().endsWith("_email.pdf")
    );

    // const attachment = "/files/Danfoss Purchase Order 4509325242.pdf";

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="text-lg font-semibold">Step 1: Email Received</div>
                <span className="rounded-full bg-[#e8a030]/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#e8a030]">
                    Received
                </span>
            </div>

            <div className="">
                <div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-3">
                        <Card label="From" value={data.from} />
                        <Card label="To" value={data.to} />
                        <Card label="Subject" value={data.subject} />
                        {attachment && (
                            <Card label="Attachment" value={attachment.file_name} />
                        )}
                        <Card label="Received At" value={data.receivedAt} />
                    </div>

                    {/* Email Body: Full-width container that handles massive or complex content safely */}
                    <div className="w-full rounded-2xl border border-[#2a2f3a] bg-[#111318] p-5 text-sm text-[#e8eaed] overflow-hidden break-words">
                        <h4 className="text-xs font-semibold text-[#80868b] uppercase tracking-wider mb-3">Email Body</h4>
                        <div
                            className="prose prose-invert max-w-none overflow-x-auto whitespace-normal"
                            dangerouslySetInnerHTML={{ __html: data.body }}
                        />
                    </div>
                </div>

                <div className="space-y-4 mt-4">
                    {attachment?.content_base64 ? (
                        <PdfPreview
                            pdfUrl={`data:application/pdf;base64,${attachment.content_base64}`}
                            title="Attachment Preview"
                        />
                    ) : null}
                </div>



            </div>
        </section>
    );
}