"use client";

import React from "react";
import { Plus, MoreHorizontal, Mail } from "lucide-react";

export default function MembersPage() {
    const members = [
        {
            id: 1,
            name: "Dr. Sarah Weber",
            email: "sarah.weber@smartarzt.com",
            role: "Owner",
            avatar: "SW",
            bg: "bg-indigo-100",
            text: "text-indigo-700"
        },
        {
            id: 2,
            name: "Markus Schmidt",
            email: "markus.schmidt@smartarzt.com",
            role: "Admin",
            avatar: "MS",
            bg: "bg-blue-100",
            text: "text-blue-700"
        },
        {
            id: 3,
            name: "Julia Meyer",
            email: "julia.meyer@smartarzt.com",
            role: "Editor",
            avatar: "JM",
            bg: "bg-green-100",
            text: "text-green-700"
        },
    ];

    return (
        <div className="w-full max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-light tracking-tight text-navy">Members</h1>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white text-sm font-medium rounded-full shadow-sm transition-all hover:shadow-md">
                    <Plus size={16} strokeWidth={2} />
                    <span>Invite people</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-floating overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="col-span-5 text-xs text-gray-500 uppercase tracking-widest font-medium">Name</div>
                    <div className="col-span-4 text-xs text-gray-500 uppercase tracking-widest font-medium">Email</div>
                    <div className="col-span-2 text-xs text-gray-500 uppercase tracking-widest font-medium">Role</div>
                    <div className="col-span-1"></div>
                </div>

                {/* List Body */}
                <div className="divide-y divide-gray-50">
                    {members.map((member) => (
                        <div key={member.id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-gray-50 transition-colors group">
                            <div className="col-span-5 flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full ${member.bg} ${member.text} flex items-center justify-center text-sm font-medium`}>
                                    {member.avatar}
                                </div>
                                <span className="text-sm font-medium text-navy">{member.name}</span>
                            </div>
                            <div className="col-span-4 flex items-center gap-2 text-gray-500">
                                <Mail size={14} className="text-gray-400" />
                                <span className="text-sm">{member.email}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                    {member.role}
                                </span>
                            </div>
                            <div className="col-span-1 text-right">
                                <button className="p-1.5 text-gray-400 hover:text-navy hover:bg-gray-200/50 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-brand flex-shrink-0">
                    <Plus size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-navy">Invite your team</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-lg mb-3">
                        Collaborate on presentations in real-time. Pro plan includes 5 free seats.
                    </p>
                    <button className="text-xs font-medium text-brand hover:text-brand-dark hover:underline">
                        Copy invite link
                    </button>
                </div>
            </div>
        </div>
    );
}
