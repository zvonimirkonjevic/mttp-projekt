"use client";

import React, { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const creditPackages = [
    { id: "500", credits: 500, price: 5 },
    { id: "1000", credits: 1000, price: 10, recommended: true },
    { id: "2500", credits: 2500, price: 25 },
    { id: "5000", credits: 5000, price: 50 },
    { id: "10000", credits: 10000, price: 100 },
];

export default function TopUpPage() {
    const [selectedPackage, setSelectedPackage] = useState(creditPackages[1]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatCredits = (credits: number) => {
        return new Intl.NumberFormat('de-DE').format(credits);
    };

    const handleCheckout = async () => {
        setLoading(true);
        setError(null);

        try {
            // Create Supabase client inside handler to avoid build-time issues
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.access_token) {
                setError("Please log in to purchase credits");
                setLoading(false);
                return;
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_CONTAINER_URL || process.env.API_CONTAINER_URL || 'http://localhost:3001';
            if (!process.env.NEXT_PUBLIC_API_CONTAINER_URL && !process.env.API_CONTAINER_URL) {
                console.warn('Client missing NEXT_PUBLIC_API_CONTAINER_URL; falling back to localhost');
            }
            const checkoutUrl = `${apiUrl}/create-checkout-session`;
            console.log("Attempting to create checkout session at:", checkoutUrl);

            const res = await fetch(
                checkoutUrl,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${session.access_token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        credit_option: selectedPackage.id
                    })
                }
            );

            if (!res.ok) {
                const errorText = await res.text();
                console.error(`Checkout session failed: ${res.status} ${res.statusText}`, errorText);
                throw new Error(`Failed to create checkout session: ${res.status} ${res.statusText}`);
            }

            const { url } = await res.json();

            if (url) {
                window.location.href = url;
            } else {
                throw new Error("No checkout URL received");
            }
        } catch (err) {
            console.error("Payment init failed", err);
            setError("Failed to initialize payment. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl">
            <h1 className="text-2xl font-light text-navy tracking-tight mb-1">Purchase Credits</h1>
            <p className="text-sm text-slate mb-8">Select a credit package below. Credits are used for presentation generation.</p>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                    {error}
                </div>
            )}

            {/* Credit Packages */}
            <div className="space-y-3 mb-8">
                {creditPackages.map((pkg) => (
                    <button
                        key={pkg.credits}
                        onClick={() => setSelectedPackage(pkg)}
                        disabled={loading}
                        className={`w-full flex items-center justify-between p-5 rounded-xl border transition-all duration-150 text-left disabled:opacity-50 ${selectedPackage.credits === pkg.credits
                            ? "border-brand bg-brand/5"
                            : "border-gray-100 bg-white hover:border-gray-200"
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            {/* Radio indicator */}
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPackage.credits === pkg.credits
                                ? "border-brand bg-brand"
                                : "border-gray-300"
                                }`}>
                                {selectedPackage.credits === pkg.credits && (
                                    <Check size={12} className="text-white" strokeWidth={3} />
                                )}
                            </div>

                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-base text-navy font-medium">
                                        {formatCredits(pkg.credits)} credits
                                    </span>
                                    {pkg.recommended && (
                                        <span className="px-2 py-0.5 bg-brand/10 text-brand text-[10px] font-medium uppercase tracking-wide rounded">
                                            Recommended
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-slate">
                                    {formatPrice(pkg.price / pkg.credits * 100)} per 100 credits
                                </span>
                            </div>
                        </div>

                        <span className={`text-lg font-medium ${selectedPackage.credits === pkg.credits ? "text-brand" : "text-navy"
                            }`}>
                            {formatPrice(pkg.price)}
                        </span>
                    </button>
                ))}
            </div>

            {/* Summary & Payment */}
            <div className="bg-[#F5F7FA] rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate">Selected package</span>
                    <span className="text-sm text-navy font-medium">{formatCredits(selectedPackage.credits)} credits</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <span className="text-sm text-slate">Amount due</span>
                    <span className="text-xl font-light text-navy tracking-tight">{formatPrice(selectedPackage.price)}</span>
                </div>
                <p className="text-[11px] text-slate mt-4">
                    By proceeding, you agree to our terms of service. Payment is processed securely via Stripe.
                </p>
            </div>

            <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-3.5 bg-brand text-white text-sm font-medium rounded-full hover:bg-brand-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Processing...</span>
                    </>
                ) : (
                    <span>Continue to Payment</span>
                )}
            </button>
        </div>
    );
}
