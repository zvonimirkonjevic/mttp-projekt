"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useGlobalTransition } from "../../dashboard/contexts/GlobalTransitionContext";
import { useUser } from "../../contexts/UserContext";
import { logoutAction } from "@/app/actions/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    ChevronRight,
    Wallet,
    Presentation,
    FileText,
    Layers,
    Key,
    Plus,
    LogOut,
    User
} from "lucide-react";

export default function Sidebar() {
    const { navigateWithTransition } = useGlobalTransition();
    const { profile, user, isLoading } = useUser();
    const [isPresentationsOpen, setIsPresentationsOpen] = useState(true);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    // Compute display values from profile/user
    const displayName = useMemo(() => {
        if (profile?.first_name || profile?.last_name) {
            return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
        }
        return user?.email?.split('@')[0] || 'User';
    }, [profile, user]);

    const userInitials = useMemo(() => {
        if (profile?.first_name && profile?.last_name) {
            return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
        }
        return displayName.slice(0, 2).toUpperCase();
    }, [profile, displayName]);

    const userEmail = user?.email || '';

    const handleNewPresentation = () => {
        const presentationId = crypto.randomUUID();
        navigateWithTransition(`/presentations/${presentationId}`);
    };

    const handleLogout = async () => {
        await logoutAction();
    };

    // Click outside handler for profile menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };

        if (isProfileMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isProfileMenuOpen]);

    // ESC key handler
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsProfileMenuOpen(false);
            }
        };

        if (isProfileMenuOpen) {
            document.addEventListener("keydown", handleEsc);
        }
        return () => document.removeEventListener("keydown", handleEsc);
    }, [isProfileMenuOpen]);

    return (
        <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-60 border-r border-gray-200 bg-gray-50 flex flex-col z-40">
            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6">
                {/* New Presentation Button */}
                <div className="px-4 mb-2">
                    <button
                        onClick={handleNewPresentation}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-xs text-white bg-brand hover:bg-brand-dark transition-colors font-medium tracking-wide rounded-full"
                    >
                        <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>New presentation</span>
                    </button>
                </div>


                {/* Presentations Section */}
                <div className="px-4 mb-2">
                    <div
                        onClick={() => setIsPresentationsOpen(!isPresentationsOpen)}
                        className="flex items-center gap-3 px-3 py-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                        <Presentation className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span className="flex-1 text-left text-[13px] font-normal tracking-wide">
                            Presentations
                        </span>
                        <ChevronDown
                            className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isPresentationsOpen ? "rotate-180" : ""}`}
                            strokeWidth={1.5}
                        />
                    </div>

                    {isPresentationsOpen && (
                        <div className="ml-6 mt-0.5">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-3 px-4 py-1.5 text-[13px] text-brand bg-brand/10 rounded-lg transition-colors font-normal tracking-wide"
                            >
                                <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
                                <span>All presentations</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Templates - Disabled */}
                <div className="px-4 mb-1">
                    <div className="flex items-center gap-3 px-3 py-1.5 text-gray-400 cursor-not-allowed">
                        <Layers className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span className="text-[13px] font-normal tracking-wide">Templates</span>
                        <span className="ml-auto text-[10px] text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded-full">Soon</span>
                    </div>
                </div>

                {/* API Keys - Disabled */}
                <div className="px-4 mb-1">
                    <div className="flex items-center gap-3 px-3 py-1.5 text-gray-400 cursor-not-allowed">
                        <Key className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span className="text-[13px] font-normal tracking-wide">API Keys</span>
                        <span className="ml-auto text-[10px] text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded-full">Soon</span>
                    </div>
                </div>
            </div>

            {/* Bottom Section - User Profile & Usage */}
            <div className="p-4 border-t border-gray-200 bg-white">
                {/* Credits Container */}
                <Link
                    href="/settings/billing"
                    className="flex items-center gap-3 p-3 mb-4 bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all rounded-xl group"
                >
                    <div className="w-8 h-8 bg-white border border-gray-200/50 rounded-full flex items-center justify-center text-brand group-hover:scale-105 transition-transform duration-200">
                        <Wallet size={14} strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                        <span className="text-sm text-gray-900 font-medium tracking-tight leading-none">
                            {isLoading ? '...' : (profile?.credits_balance ?? 0)}
                        </span>
                        <span className="text-[10px] text-gray-500 font-normal leading-none">Credits remaining</span>
                    </div>
                    <ChevronRight size={12} className="text-gray-400 ml-auto group-hover:text-gray-600 transition-colors" strokeWidth={1.5} />
                </Link>

                {/* User Profile with Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                    <button
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className={`w-full flex items-center gap-3 p-2 -m-2 rounded-xl transition-all ${isProfileMenuOpen
                            ? "bg-gray-50"
                            : "hover:bg-gray-50"
                            }`}
                    >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 border border-indigo-200/60 flex items-center justify-center text-xs font-medium text-indigo-600 shadow-sm overflow-hidden">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                                userInitials
                            )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <div className="text-[13px] font-medium text-gray-900 truncate">{displayName}</div>
                            <div className="text-[11px] text-brand truncate">Pro Plan</div>
                        </div>
                        <ChevronDown
                            size={14}
                            strokeWidth={1.5}
                            className={`text-gray-400 transition-transform duration-200 ${isProfileMenuOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    {/* Profile Dropdown Menu */}
                    <AnimatePresence>
                        {isProfileMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                                className="absolute bottom-full -left-4 -right-4 mb-2 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden"
                            >
                                {/* User Info Header */}
                                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                    <div className="text-[13px] font-medium text-gray-900">{displayName}</div>
                                    <div className="text-[11px] text-gray-500">{userEmail}</div>
                                </div>

                                {/* Menu Items */}
                                <div className="py-1.5">
                                    <Link
                                        href="/settings/details"
                                        onClick={() => setIsProfileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                    >
                                        <User size={15} strokeWidth={1.5} className="text-gray-400" />
                                        <span>Account settings</span>
                                    </Link>
                                </div>

                                {/* Logout Section */}
                                <div className="border-t border-gray-100 py-1.5">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut size={15} strokeWidth={1.5} />
                                        <span>Log out</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </aside>
    );
}