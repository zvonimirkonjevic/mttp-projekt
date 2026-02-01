"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ChevronLeft,
    Clock,
    User,
    CreditCard
} from "lucide-react";
import { GlobalTransitionProvider } from "../dashboard/contexts/GlobalTransitionContext";

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navItems = [
        { name: "Activity log", href: "/settings/audit", icon: Clock },
        { name: "Account", href: "/settings/details", icon: User },
        { name: "Billing", href: "/settings/billing", icon: CreditCard },
    ];

    return (
        <GlobalTransitionProvider className="flex min-h-screen bg-white font-sans">
            {/* Settings Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-100 bg-white flex flex-col z-50">
                <div className="p-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-gray-500 hover:text-navy transition-colors mb-8 text-xs"
                    >
                        <ChevronLeft size={14} />
                        Back to presentations
                    </Link>

                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] transition-colors ${isActive
                                        ? "bg-brand/5 text-brand"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-navy"
                                        }`}
                                >
                                    <Icon size={16} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="ml-64 flex-1 p-8">
                {children}
            </main>
        </GlobalTransitionProvider>
    );
}
