"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet, FileText, Layout, UploadCloud, CheckCircle, XCircle } from "lucide-react";
import { useGlobalTransition } from "../../dashboard/contexts/GlobalTransitionContext";
import { useUser } from "../../contexts/UserContext";
import { useSearchParams } from "next/navigation";

export default function BillingPage() {
    const { navigateWithTransition } = useGlobalTransition();
    const { profile, isLoading, refreshProfile } = useUser();
    const searchParams = useSearchParams();
    const [paymentStatus, setPaymentStatus] = useState<"success" | "cancelled" | null>(null);

    useEffect(() => {
        const payment = searchParams.get("payment");
        if (payment === "success") {
            setPaymentStatus("success");
            // Refresh user profile to get updated credits
            refreshProfile?.();
            // Clear the query parameter after 5 seconds
            const timer = setTimeout(() => {
                setPaymentStatus(null);
                window.history.replaceState({}, "", "/settings/billing");
            }, 5000);
            return () => clearTimeout(timer);
        } else if (payment === "cancelled") {
            setPaymentStatus("cancelled");
            // Clear the query parameter after 5 seconds
            const timer = setTimeout(() => {
                setPaymentStatus(null);
                window.history.replaceState({}, "", "/settings/billing");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [searchParams, refreshProfile]);

    const handleNewPresentation = () => {
        const presentationId = crypto.randomUUID();
        const targetUrl = `/presentations/${presentationId}`;
        navigateWithTransition(targetUrl);
    };

    return (
        <div className="w-full max-w-4xl">
            {/* Header */}
            <h1 className="text-2xl font-light text-navy tracking-tight mb-8">Billing</h1>

            {/* Payment Status Messages */}
            {paymentStatus === "success" && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-green-900">Payment successful!</p>
                        <p className="text-xs text-green-700 mt-0.5">Your credits have been added to your account.</p>
                    </div>
                </div>
            )}

            {paymentStatus === "cancelled" && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
                    <XCircle size={20} className="text-yellow-600 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-yellow-900">Payment cancelled</p>
                        <p className="text-xs text-yellow-700 mt-0.5">Your payment was cancelled. No charges were made.</p>
                    </div>
                </div>
            )}

            {/* Plan Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-base text-navy">Self-serve</h2>
                    <p className="text-sm text-slate mt-1">Free Plan</p>
                </div>
                <button className="px-5 py-2 border border-gray-200 text-navy text-sm rounded-full hover:bg-gray-50 hover:border-gray-300 transition-colors">
                    Upgrade plan
                </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

                {/* Credits Card (Primary) */}
                <div className="bg-[#F5F7FA] rounded-2xl p-6 relative overflow-hidden">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-brand">
                            <Wallet size={18} />
                        </div>
                    </div>
                    <div className="mb-6">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-light text-navy tabular-nums tracking-tight">
                                {isLoading ? '...' : (profile?.credits_balance ?? 0)}
                            </span>
                            <span className="text-sm text-slate">Credits</span>
                        </div>
                        <p className="text-xs text-slate mt-1">Available for use</p>
                    </div>
                    <Link
                        href="/settings/topup"
                        className="px-5 py-2.5 bg-brand text-white text-sm font-medium rounded-full hover:bg-brand-dark transition-colors inline-block"
                    >
                        Top up credits
                    </Link>
                </div>

                {/* Presentations Generated Card */}
                <div className="bg-[#F5F7FA] rounded-2xl p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-slate">
                            <FileText size={18} />
                        </div>
                        <span className="text-sm text-navy">Presentations generated</span>
                    </div>
                    <div className="w-full h-2 bg-white rounded-full mb-2 overflow-hidden">
                        <div className="h-full bg-brand w-[1%]" />
                    </div>
                    <p className="text-xs text-slate">0 of Unlimited</p>
                </div>

                {/* Custom Templates Card */}
                <div className="bg-[#F5F7FA] rounded-2xl p-6 flex flex-col justify-center opacity-60">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-slate">
                            <Layout size={18} />
                        </div>
                        <span className="text-sm text-navy">Custom Templates</span>
                    </div>
                    <div className="w-full h-2 bg-white rounded-full mb-2" />
                    <p className="text-xs text-slate">Coming soon</p>
                </div>
            </div>

            {/* Usage History */}
            <div>
                <h3 className="text-xs text-slate uppercase tracking-widest font-medium mb-3">Generation History</h3>
                <p className="text-sm text-slate mb-4">22/12/25 to 05/01/26</p>

                <div className="bg-[#F5F7FA] rounded-2xl py-16 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-white border border-gray-100 rounded-full flex items-center justify-center text-slate mb-4">
                        <UploadCloud size={28} />
                    </div>
                    <h4 className="text-base text-navy mb-1">No presentations generated yet</h4>
                    <p className="text-sm text-slate mb-6 max-w-sm">
                        Create your first financial presentation to track your usage
                    </p>
                    <button
                        onClick={handleNewPresentation}
                        className="px-6 py-2.5 bg-brand text-white text-sm font-medium rounded-full hover:bg-brand-dark transition-colors"
                    >
                        Create Presentation
                    </button>
                </div>
            </div>
        </div>
    );
}
