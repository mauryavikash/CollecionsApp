"use client";


import React from 'react';

export default function DashboardPage() {
    return (
        // https://app.powerbi.com/reportEmbed?reportId=1e804c5a-5777-41e4-b303-f6caf5e6db0c&autoAuth=true&ctid=c6823a59-1301-40c3-9d06-8685d8d732d8&actionBarEnabled=true&reportCopilotInEmbed=true%22
        // https://app.powerbi.com/reportEmbed?reportId=5485da49-f278-4e93-b904-b733d7407a15&autoAuth=true&ctid=76a2ae5a-9f00-4f6b-95ed-5d33d77c4d61&actionBarEnabled=true%22
        <div className="space-y-6">
            <iframe
                title="RFQ Automation"
                className="w-full rounded-lg h-screen"
                src="https://app.powerbi.com/reportEmbed?reportId=1e804c5a-5777-41e4-b303-f6caf5e6db0c&autoAuth=true&ctid=c6823a59-1301-40c3-9d06-8685d8d732d8&actionBarEnabled=true&reportCopilotInEmbed=true%22"
                frameBorder="0" allowFullScreen={true}></iframe>


        </div >
    );
}
