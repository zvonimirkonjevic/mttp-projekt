"use client";

import React from "react";
import { Clock, Shield, Globe, Monitor } from "lucide-react";

export default function AuditPage() {
    const events = [
        {
            id: 1,
            event: "Login",
            date: "Today at 09:42 AM",
            ip: "192.168.1.1",
            icon: Monitor
        },
        {
            id: 2,
            event: "Presentation created",
            date: "Yesterday at 4:15 PM",
            ip: "192.168.1.1",
            icon: Clock
        },
        {
            id: 3,
            event: "Plan upgraded to Pro",
            date: "Jan 15, 2026 at 11:20 AM",
            ip: "192.168.1.1",
            icon: Shield
        },
        {
            id: 4,
            event: "API Key generated",
            date: "Jan 12, 2026 at 2:00 PM",
            ip: "10.0.0.42",
            icon: Globe
        },
    ];

    return (
        <div className="w-full max-w-4xl">
            <h1 className="text-2xl font-light text-navy tracking-tight mb-8">Activity Log</h1>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 px-6 py-3 border-b border-gray-100 bg-[#F5F7FA]">
                    <div className="col-span-6 text-xs text-slate uppercase tracking-widest font-medium">Activity</div>
                    <div className="col-span-3 text-xs text-slate uppercase tracking-widest font-medium">Date</div>
                    <div className="col-span-3 text-xs text-slate uppercase tracking-widest font-medium text-right">IP Address</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-50">
                    {events.map((event) => (
                        <div key={event.id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors">
                            <div className="col-span-6 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#F5F7FA] flex items-center justify-center text-slate">
                                    <event.icon size={14} />
                                </div>
                                <span className="text-sm text-navy">{event.event}</span>
                            </div>
                            <div className="col-span-3 text-xs text-slate">
                                {event.date}
                            </div>
                            <div className="col-span-3 text-xs text-slate font-mono text-right">
                                {event.ip}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <p className="mt-4 text-xs text-slate text-center">
                Showing last 30 days of activity.
            </p>
        </div>
    );
}
