"use client";

import { X } from "lucide-react";
import Link from "next/link";

export default function PresentationHeader() {
    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-center relative px-6">
            {/* Logo */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-light text-brand tracking-tight">
                flashslides
            </div>
            {/* Title */}
            <div className="flex items-center">
                <span className="text-sm font-medium text-black">
                    Configure Presentation
                </span>
            </div>

            {/* Close Button */}
            <Link
                href="/dashboard"
                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
                <X className="w-5 h-5" />
            </Link>
        </header>
    );
}
