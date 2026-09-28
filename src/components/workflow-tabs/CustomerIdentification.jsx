'use client';

import { User } from 'lucide-react';
import Card from './Card';


export default function CustomerIdentification({ data }) {
    if (!data) return null;

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="text-lg font-semibold">Step 2: Customer identification</div>
                <span className="rounded-full bg-[#60a5fa]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#60a5fa]">
                    Verified
                </span>
            </div>

            <div className="rounded-3xl border border-[#2a2f3a] bg-[#0f1319] p-5">
                <div className="flex items-start gap-4 border-b border-[#2a2f3a] pb-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#34d399]/10 text-[#34d399]">
                        <User className="h-5 w-5" />
                    </span>
                    <div>
                        <div className="text-sm font-semibold text-[#e8eaed] break-all">Customer Lookup</div>
                        <div className="mt-1 text-sm text-[#9aa0ad]">
                            {data.verificationSource}
                        </div>
                    </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <Card label="Customer Name" value={data.customerName} />
                    <Card label="Company" value={data.companyName} />
                    <Card label="Customer ID" value={data.customerId} />
                    <Card label="Email" value={data.email} />
                    <Card label="Account Status" value={data.status} />
                </div>
            </div>
        </section>
    );
}