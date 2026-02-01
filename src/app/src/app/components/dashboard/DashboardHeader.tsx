"use client";

import Link from "next/link";

export default function DashboardHeader() {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
            <div className="h-full flex items-center justify-between px-6">
                {/* Logo - matching landing page Navbar */}
                <Link href="/dashboard" className="text-xl font-light text-brand tracking-tight">
                    flashslides
                </Link>

                {/* Right side - User controls */}
                <div className="flex items-center gap-4">
                    {/* Placeholder for future header items if needed, currently empty as Profile is in Sidebar */}
                </div>
            </div>
        </header>
    );
}
